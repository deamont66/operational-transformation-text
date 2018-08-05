import { TextOperation } from '../operations/TextOperation';
import { Selection } from '../operations/Selection';
import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';
import { TypedEvent } from '../utils/TypedEvent';
import { Signal } from '../utils/Signal';
import { RemoteClient } from './RemoteClient';

/**
 * AbstractServerAdapter for EditorClient
 *
 * @export
 * @abstract
 * @class ServerAdapter
 * @template TId remote client identificator type
 */
export abstract class AbstractServerAdapter<TId> {
    /**
     * <client> - client left document
     *
     * @memberof ServerAdapter
     */
    clientLeft = new SimpleTypedEvent<RemoteClient<TId>>();

    /**
     * <client, name> - client name set
     *
     * @memberof ServerAdapter
     */
    clientNameChange = new TypedEvent<RemoteClient<TId>, string>();

    /**
     * server operation ack
     *
     * @memberof ServerAdapter
     */
    operationAck = new Signal();

    /**
     * <operation> - received operation
     *
     * @memberof ServerAdapter
     */
    operationRecieved = new SimpleTypedEvent<TextOperation>();

    /**
     * <client, selection> - received client selection change
     *
     * @memberof ServerAdapter
     */
    selectionRecieved = new TypedEvent<RemoteClient<TId>, Selection>();

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
