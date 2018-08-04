"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ClientState_1 = require("./ClientState");
var AbstractLocalClient = /** @class */ (function () {
    function AbstractLocalClient(revision) {
        this.revision = revision;
        this.state = ClientState_1.synchronizedInstance;
    }
    /**
     * Sets new client state.
     *
     * @param {ClientState} state
     * @memberof LocalClient
     */
    AbstractLocalClient.prototype.setState = function (state) {
        this.state = state;
    };
    /**
     * Call this method when the user changes the document.
     *
     * @param {TextOperation} operation
     * @memberof LocalClient
     */
    AbstractLocalClient.prototype.applyClient = function (operation) {
        this.setState(this.state.applyClient(this, operation));
    };
    /**
     * Call this method with a new operation from the server
     *
     * @param {TextOperation} operation
     * @memberof LocalClient
     */
    AbstractLocalClient.prototype.applyServer = function (operation) {
        this.revision++;
        this.setState(this.state.applyServer(this, operation));
    };
    /**
     * Call this method when server ack was recieved.
     *
     * @memberof LocalClient
     */
    AbstractLocalClient.prototype.serverAck = function () {
        this.revision++;
        this.setState(this.state.serverAck(this));
    };
    /**
     * Call this method when reconnected to server and want to resend last pending operation (if any).
     *
     * @memberof LocalClient
     */
    AbstractLocalClient.prototype.serverReconnect = function () {
        this.state.resend(this);
    };
    /**
     * Transforms a selection from the latest known server state to the current
     * client state. For example, if we get from the server the information that
     * another user's cursor is at position 3, but the server hasn't yet received
     * our newest operation, an insertion of 5 characters at the beginning of the
     * document, the correct position of the other user's cursor in our current
     * document is 8.
     *
     * @param {Selection} selection
     * @returns {Selection}
     * @memberof AbstractLocalClient
     */
    AbstractLocalClient.prototype.transformSelection = function (selection) {
        return this.state.transformSelection(selection);
    };
    return AbstractLocalClient;
}());
exports.AbstractLocalClient = AbstractLocalClient;
