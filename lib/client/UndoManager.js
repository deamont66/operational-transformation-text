"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WrappedOperation_1 = require("../operations/WrappedOperation");
var UndoManagerState;
(function (UndoManagerState) {
    UndoManagerState[UndoManagerState["NORMAL_STATE"] = 0] = "NORMAL_STATE";
    UndoManagerState[UndoManagerState["UNDOING_STATE"] = 1] = "UNDOING_STATE";
    UndoManagerState[UndoManagerState["REDOING_STATE"] = 2] = "REDOING_STATE";
})(UndoManagerState = exports.UndoManagerState || (exports.UndoManagerState = {}));
/**
 * Undo manager for WrappedOperation
 *
 * @export
 * @class UndoManager
 */
var UndoManager = /** @class */ (function () {
    function UndoManager(maxItems) {
        if (maxItems === void 0) { maxItems = 50; }
        this.maxItems = maxItems;
        this.state = UndoManagerState.NORMAL_STATE;
        this.dontCompose = false;
        this.undoStack = [];
        this.redoStack = [];
    }
    /**
     * Adds operation to stack depending on state.
     *
     * @param {WrappedOperation} operation
     * @param {boolean} [compose=false]
     * @memberof UndoManager
     */
    UndoManager.prototype.add = function (operation, compose) {
        if (compose === void 0) { compose = false; }
        switch (this.state) {
            case UndoManagerState.UNDOING_STATE: {
                this.redoStack.push(operation);
                this.dontCompose = true;
                break;
            }
            case UndoManagerState.REDOING_STATE: {
                this.undoStack.push(operation);
                this.dontCompose = true;
                break;
            }
            // NORMAL_STATE
            default: {
                if (!this.dontCompose && compose && this.undoStack.length > 0) {
                    this.undoStack.push(operation.compose(this.undoStack.pop()));
                }
                else {
                    this.undoStack.push(operation);
                    if (this.undoStack.length > this.maxItems) {
                        this.undoStack.shift();
                    }
                }
                this.dontCompose = false;
                this.redoStack = [];
            }
        }
    };
    /**
     * Transforms both stack based on passed operation.
     *
     * @param {WrappedOperation} operation
     * @memberof UndoManager
     */
    UndoManager.prototype.transform = function (operation) {
        this.undoStack = UndoManager.transformStack(this.undoStack, operation);
        this.redoStack = UndoManager.transformStack(this.redoStack, operation);
    };
    /**
     * Performs single undo. Calls callback with undo operation.
     *
     * @param {Callback} callback
     * @memberof UndoManager
     */
    UndoManager.prototype.performUndo = function (callback) {
        this.state = UndoManagerState.UNDOING_STATE;
        if (this.undoStack.length === 0) {
            throw new Error('undo not possible');
        }
        callback(this.undoStack.pop());
        this.state = UndoManagerState.NORMAL_STATE;
    };
    /**
     * Performs single redo (inverse to performUndo). Calls callback with redo operation.
     *
     * @param {Callback} callback
     * @memberof UndoManager
     */
    UndoManager.prototype.performRedo = function (callback) {
        this.state = UndoManagerState.REDOING_STATE;
        if (this.redoStack.length === 0) {
            throw new Error('redo not possible');
        }
        callback(this.redoStack.pop());
        this.state = UndoManagerState.NORMAL_STATE;
    };
    /**
     * Decides whenever is undo available (based on undoStack size).
     *
     * @returns {boolean} is undo available
     * @memberof UndoManager
     */
    UndoManager.prototype.canUndo = function () {
        return this.undoStack.length !== 0;
    };
    /**
     * Decides whenever is redo available (based on redoStack size).
     *
     * @returns {boolean} is redo available
     * @memberof UndoManager
     */
    UndoManager.prototype.canRedo = function () {
        return this.redoStack.length !== 0;
    };
    /**
     * Checks state of this UndoManager instance.
     *
     * @returns {boolean} is undoing operation in process
     * @memberof UndoManager
     */
    UndoManager.prototype.isUndoing = function () {
        return this.state === UndoManagerState.UNDOING_STATE;
    };
    /**
     * Checks state of this UndoManager instance.
     *
     * @returns {boolean} is redoing operation in process
     * @memberof UndoManager
     */
    UndoManager.prototype.isRedoing = function () {
        return this.state === UndoManagerState.REDOING_STATE;
    };
    /**
     * Transforms given stack according to new operation.
     *
     * @param {WrappedOperation[]} stack
     * @param {WrappedOperation} operation
     * @returns {WrappedOperation[]}
     */
    UndoManager.transformStack = function (stack, operation) {
        var newStack = [];
        for (var i = stack.length - 1; i >= 0; i--) {
            var pair = WrappedOperation_1.WrappedOperation.transform(stack[i], operation);
            newStack.push(pair[0]);
            operation = pair[1];
        }
        return newStack.reverse();
    };
    return UndoManager;
}());
exports.UndoManager = UndoManager;
