"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractLocalClient_1 = require("./AbstractLocalClient");
var Selection_1 = require("../operations/Selection");
var RemoteClient_1 = require("./RemoteClient");
var UndoManager_1 = require("./UndoManager");
var WrappedOperation_1 = require("../operations/WrappedOperation");
var ClientState_1 = require("./ClientState");
var SimpleTypedEvent_1 = require("../utils/SimpleTypedEvent");
var SelfSelection_1 = require("../operations/SelfSelection");
var LocalClient = /** @class */ (function (_super) {
    __extends(LocalClient, _super);
    function LocalClient(revision, clients, serverAdapter, editorAdapter) {
        var _this = _super.call(this, revision) || this;
        _this.clientsChanged = new SimpleTypedEvent_1.SimpleTypedEvent();
        _this.setClientName = function (clientId, name) {
            var client = _this.getClient(clientId);
            client.setName(name);
            _this.clientsChanged.emit(_this.clients);
        };
        _this.onClientLeft = function (clientId) {
            var client = _this.clients.get(clientId);
            if (!client) {
                return;
            }
            client.remove();
            _this.clients.delete(clientId);
            _this.clientsChanged.emit(_this.clients);
        };
        _this.onReceivedOperation = function (operation) {
            _this.applyServer(operation);
        };
        _this.onReceivedSelection = function (clientId, selection) {
            if (selection) {
                _this.getClient(clientId).updateSelection(_this.transformSelection(selection));
            }
            else {
                _this.getClient(clientId).removeSelection();
            }
        };
        _this.undo = function () {
            if (!_this.undoManager.canUndo()) {
                return;
            }
            _this.undoManager.performUndo(function (o) {
                _this.applyUnredo(o);
            });
        };
        _this.redo = function () {
            if (!_this.undoManager.canRedo()) {
                return;
            }
            _this.undoManager.performRedo(function (o) {
                _this.applyUnredo(o);
            });
        };
        _this.onChange = function (_a) {
            var operation = _a.operation, inverseOperation = _a.inverseOperation;
            var selectionBefore = _this.lastSelection;
            _this.updateSelection();
            var compose = _this.undoManager.undoStack.length > 0 &&
                inverseOperation.shouldBeComposedWithInverted(_this.undoManager.undoStack[_this.undoManager.undoStack.length - 1].operation);
            var inverseMeta = new SelfSelection_1.SelfSelection(_this.lastSelection, selectionBefore);
            _this.undoManager.add(new WrappedOperation_1.WrappedOperation(inverseOperation, inverseMeta), compose);
            _this.applyClient(operation);
        };
        _this.onSelectionChange = function () {
            var oldSelection = _this.lastSelection;
            _this.updateSelection();
            if (oldSelection && _this.lastSelection.equals(oldSelection)) {
                return;
            }
            _this.sendSelection(_this.lastSelection);
        };
        _this.onBlur = function () {
            _this.lastSelection = new Selection_1.Selection([]);
            _this.sendSelection(null);
        };
        _this.serverAdapter = serverAdapter;
        _this.editorAdapter = editorAdapter;
        _this.undoManager = new UndoManager_1.UndoManager();
        _this.lastSelection = new Selection_1.Selection([]);
        _this.clients = new Map();
        _this.initializeClients(clients);
        _this.editorAdapter.change.on(_this.onChange);
        _this.editorAdapter.selectionChange.on(_this.onSelectionChange);
        _this.editorAdapter.blur.on(_this.onBlur);
        _this.editorAdapter.undo.on(_this.undo);
        _this.editorAdapter.redo.on(_this.redo);
        _this.serverAdapter.clientLeft.on(_this.onClientLeft);
        _this.serverAdapter.clientNameChange.on(_this.setClientName);
        _this.serverAdapter.operationAck.on(_this.serverAck);
        _this.serverAdapter.operationRecieved.on(_this.onReceivedOperation);
        _this.serverAdapter.selectionRecieved.on(_this.onReceivedSelection);
        return _this;
    }
    LocalClient.prototype.addClient = function (client) {
        client.setEditorAdapter(this.editorAdapter);
        this.clients.set(client.id, client);
        this.clientsChanged.emit(this.clients);
    };
    LocalClient.prototype.setClients = function (clients) {
        var _this = this;
        this.clients.forEach(function (client) {
            client.remove();
        });
        this.clients.clear();
        var newClients = new Map();
        clients.forEach(function (client) {
            if (client.lastSelection) {
                var selection = _this.transformSelection(client.lastSelection);
                client.updateSelection(selection);
            }
            client.setEditorAdapter(_this.editorAdapter);
            newClients.set(client.id, client);
        });
        this.clients = newClients;
        this.clientsChanged.emit(this.clients);
    };
    LocalClient.prototype.initializeClients = function (clients) {
        var _this = this;
        this.clients.clear();
        clients.forEach(function (client) {
            client.setEditorAdapter(_this.editorAdapter);
            _this.clients.set(client.id, client);
        });
        this.clientsChanged.emit(this.clients);
    };
    LocalClient.prototype.getClient = function (clientId) {
        var client = this.clients.get(clientId);
        if (!client) {
            client = new RemoteClient_1.RemoteClient(clientId);
            client.setEditorAdapter(this.editorAdapter);
            this.clients.set(clientId, client);
        }
        return client;
    };
    LocalClient.prototype.applyUnredo = function (operation) {
        this.undoManager.add(operation.invert(this.editorAdapter.getValue()));
        this.editorAdapter.applyOperation(operation.operation);
        this.lastSelection = operation.selection
            ? operation.selection.selectionAfter
            : new Selection_1.Selection([]);
        this.editorAdapter.setSelection(this.lastSelection);
        this.applyClient(operation.operation);
    };
    LocalClient.prototype.updateSelection = function () {
        this.lastSelection = this.editorAdapter.getSelection();
    };
    LocalClient.prototype.sendSelection = function (selection) {
        if (this.state instanceof ClientState_1.AwaitingWithBuffer) {
            return;
        }
        this.serverAdapter.sendSelection(selection);
    };
    /**
     * Called by Client to send new operation to serverAdapter.
     * @param revision
     * @param operation
     */
    LocalClient.prototype.sendOperation = function (revision, operation) {
        this.serverAdapter.sendOperation(revision, operation, this.lastSelection);
    };
    /**
     * Called by AbstractLocalClient state to apply operation to editorAdapter.
     * @param {TextOperation} operation
     */
    LocalClient.prototype.applyOperation = function (operation) {
        this.editorAdapter.applyOperation(operation);
        this.updateSelection();
        this.undoManager.transform(new WrappedOperation_1.WrappedOperation(operation, null));
    };
    return LocalClient;
}(AbstractLocalClient_1.AbstractLocalClient));
exports.LocalClient = LocalClient;
