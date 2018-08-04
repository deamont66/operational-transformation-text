"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SimpleTypedEvent_1 = require("../utils/SimpleTypedEvent");
var TypedEvent_1 = require("../utils/TypedEvent");
var Signal_1 = require("../utils/Signal");
/**
 * AbstractServerAdapter for EditorClient
 *
 * @export
 * @abstract
 * @class ServerAdapter
 * @template TClient
 */
var ServerAdapter = /** @class */ (function () {
    function ServerAdapter() {
        /**
         * <client> - client left document
         *
         * @memberof ServerAdapter
         */
        this.clientLeft = new SimpleTypedEvent_1.SimpleTypedEvent();
        /**
         * <client, name> - client name set
         *
         * @memberof ServerAdapter
         */
        this.setClientName = new TypedEvent_1.TypedEvent();
        /**
         * server operation ack
         *
         * @memberof ServerAdapter
         */
        this.operationAck = new Signal_1.Signal();
        /**
         * <operation> - received operation
         *
         * @memberof ServerAdapter
         */
        this.operationRecieved = new SimpleTypedEvent_1.SimpleTypedEvent();
        /**
         * <client, selection> - received client selection change
         *
         * @memberof ServerAdapter
         */
        this.selectionRecieved = new TypedEvent_1.TypedEvent();
    }
    return ServerAdapter;
}());
exports.ServerAdapter = ServerAdapter;
