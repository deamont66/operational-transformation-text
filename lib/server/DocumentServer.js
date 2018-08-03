"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TextOperation_1 = require("../operations/TextOperation");
var TypedEvent_1 = require("../utils/TypedEvent");
var DocumentServer = /** @class */ (function () {
    function DocumentServer(revision) {
        if (revision === void 0) { revision = 0; }
        this.recievedOperation = new TypedEvent_1.TypedEvent();
        this.currentRevision = revision;
    }
    DocumentServer.prototype.receiveOperation = function (operationRevision, operation) {
        var transformedOperation = this.transformReceivedOperation(operationRevision, operation);
        this.recievedOperation.emit(transformedOperation);
        return transformedOperation;
    };
    DocumentServer.prototype.transformReceivedOperation = function (operationRevision, operation) {
        // Find all operations that the client didn't know of when it sent the
        // operation ...
        var concurrentOperations = this.getOperationsAfterRevision(operationRevision);
        // ... and transform the operation against all these operations.
        for (var i = 0; i < concurrentOperations.length; i++) {
            operation = TextOperation_1.TextOperation.transform(operation, concurrentOperations[i])[0];
        }
        return operation;
    };
    DocumentServer.prototype.getRevision = function () {
        return this.currentRevision;
    };
    return DocumentServer;
}());
exports.DocumentServer = DocumentServer;
