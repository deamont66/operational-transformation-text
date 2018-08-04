import { TextOperation } from '../operations/TextOperation';
import { Selection } from '../operations/Selection';
import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';
import { TypedEvent } from '../utils/TypedEvent';
import { Signal } from '../utils/Signal';
/**
 * AbstractServerAdapter for EditorClient
 *
 * @export
 * @abstract
 * @class ServerAdapter
 * @template TClient
 */
export declare abstract class ServerAdapter<TClient> {
    /**
     * <client> - client left document
     *
     * @memberof ServerAdapter
     */
    clientLeft: SimpleTypedEvent<TClient>;
    /**
     * <client, name> - client name set
     *
     * @memberof ServerAdapter
     */
    setClientName: TypedEvent<TClient, string>;
    /**
     * server operation ack
     *
     * @memberof ServerAdapter
     */
    operationAck: Signal;
    /**
     * <operation> - received operation
     *
     * @memberof ServerAdapter
     */
    operationRecieved: SimpleTypedEvent<TextOperation>;
    /**
     * <client, selection> - received client selection change
     *
     * @memberof ServerAdapter
     */
    selectionRecieved: TypedEvent<TClient, Selection>;
    /**
     * Gets called for emitting new Operation to server.
     *
     * @param {Number} revision - last received revision number
     * @param {Operation} operation - operation
     * @param {Selection} selection - meta selection data
     */
    abstract sendOperation(revision: number, operation: TextOperation, selection: Selection): void;
    /**
     * Gets called for emitting new Selection to server.
     *
     * @param {Selection} selection
     */
    abstract sendSelection(selection: Selection): void;
}
