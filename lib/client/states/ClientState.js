"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TextOperation_1 = require("../../operations/TextOperation");
var Synchronized = /** @class */ (function () {
    function Synchronized() {
    }
    Synchronized.prototype.applyClient = function (client, operation) {
        // When the user makes an edit, send the operation to the server and
        // switch to the 'AwaitingConfirm' state
        client.sendOperation(client.revision, operation);
        return new AwaitingConfirm(operation);
    };
    Synchronized.prototype.applyServer = function (client, operation) {
        // When we receive a new operation from the server, the operation can be
        // simply applied to the current document
        client.applyOperation(operation);
        return this;
    };
    Synchronized.prototype.serverAck = function (client) {
        throw new Error('There is no pending operation (client is not expecting server ack).');
    };
    Synchronized.prototype.transformSelection = function (selection) {
        // Nothing to do because the latest server state and client state are the same.
        return selection;
    };
    Synchronized.prototype.resend = function () { };
    return Synchronized;
}());
exports.Synchronized = Synchronized;
exports.synchronizedInstance = new Synchronized();
var AwaitingConfirm = /** @class */ (function () {
    function AwaitingConfirm(outstanding) {
        this.outstanding = outstanding;
    }
    AwaitingConfirm.prototype.applyClient = function (client, operation) {
        // When the user makes an edit, don't send the operation immediately,
        // instead switch to 'AwaitingWithBuffer' state
        return new AwaitingWithBuffer(this.outstanding, operation);
    };
    AwaitingConfirm.prototype.applyServer = function (client, operation) {
        // This is another client's operation. Visualization:
        //
        //                   /\
        // this.outstanding /  \ operation
        //                 /    \
        //                 \    /
        //  pair[1]         \  / pair[0] (new outstanding)
        //  (can be applied  \/
        //  to the client's
        //  current document)
        var pair = TextOperation_1.TextOperation.transform(this.outstanding, operation);
        client.applyOperation(pair[1]);
        return new AwaitingConfirm(pair[0]);
    };
    AwaitingConfirm.prototype.serverAck = function (client) {
        // The client's operation has been acknowledged
        // => switch to synchronized state
        return exports.synchronizedInstance;
    };
    AwaitingConfirm.prototype.transformSelection = function (selection) {
        return selection.transform(this.outstanding);
    };
    AwaitingConfirm.prototype.resend = function (client) {
        // The confirm didn't come because the client was disconnected.
        // Now that it has reconnected, we resend the outstanding operation.
        client.sendOperation(client.revision, this.outstanding);
    };
    return AwaitingConfirm;
}());
exports.AwaitingConfirm = AwaitingConfirm;
var AwaitingWithBuffer = /** @class */ (function () {
    function AwaitingWithBuffer(outstanding, buffer) {
        // Save the pending operation and the user's edits since then
        this.outstanding = outstanding;
        this.buffer = buffer;
    }
    AwaitingWithBuffer.prototype.applyClient = function (client, operation) {
        // Compose the user's changes onto the buffer
        var newBuffer = this.buffer.compose(operation);
        return new AwaitingWithBuffer(this.outstanding, newBuffer);
    };
    AwaitingWithBuffer.prototype.applyServer = function (client, operation) {
        // Operation comes from another client
        //
        //                       /\
        //     this.outstanding /  \ operation
        //                     /    \
        //                    /\    /
        //       this.buffer /  \* / pair1[0] (new outstanding)
        //                  /    \/
        //                  \    /
        //          pair2[1] \  / pair2[0] (new buffer)
        // the transformed    \/
        // operation -- can
        // be applied to the
        // client's current
        // document
        //
        // * pair1[1]
        var pair1 = TextOperation_1.TextOperation.transform(this.outstanding, operation);
        var pair2 = TextOperation_1.TextOperation.transform(this.buffer, pair1[1]);
        client.applyOperation(pair2[1]);
        return new AwaitingWithBuffer(pair1[0], pair2[0]);
    };
    AwaitingWithBuffer.prototype.serverAck = function (client) {
        // The pending operation has been acknowledged
        // => send buffer
        client.sendOperation(client.revision, this.buffer);
        return new AwaitingConfirm(this.buffer);
    };
    AwaitingWithBuffer.prototype.transformSelection = function (selection) {
        return selection.transform(this.outstanding).transform(this.buffer);
    };
    AwaitingWithBuffer.prototype.resend = function (client) {
        // The confirm didn't come because the client was disconnected.
        // Now that it has reconnected, we resend the outstanding operation.
        client.sendOperation(client.revision, this.outstanding);
    };
    return AwaitingWithBuffer;
}());
exports.AwaitingWithBuffer = AwaitingWithBuffer;
