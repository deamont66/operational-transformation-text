import { TextOperation } from '..';
import { Selection } from '../operations/Selection';
import { ClientState, synchronizedInstance } from './ClientState';
import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';

export abstract class AbstractLocalClient {
    revision: number;
    state: ClientState;

    stateChange = new SimpleTypedEvent<ClientState>();

    constructor(revision: number) {
        this.revision = revision;
        this.state = synchronizedInstance;
    }

    /**
     * Sets new client state.
     *
     * @param {ClientState} state
     * @memberof LocalClient
     */
    setState(state: ClientState) {
        this.state = state;
        this.stateChange.emit(state);
    }

    /**
     * Call this method when the user changes the document.
     *
     * @param {TextOperation} operation
     * @memberof LocalClient
     */
    applyClient(operation: TextOperation) {
        this.setState(this.state.applyClient(this, operation));
    }

    /**
     * Call this method with a new operation from the server
     *
     * @param {TextOperation} operation
     * @memberof LocalClient
     */
    applyServer(operation: TextOperation) {
        this.revision++;
        this.setState(this.state.applyServer(this, operation));
    }

    /**
     * Call this method when server ack was recieved.
     *
     * @memberof LocalClient
     */
    serverAck = () => {
        this.revision++;
        this.setState(this.state.serverAck(this));
    };

    /**
     * Call this method when reconnected to server and want to resend last pending operation (if any).
     *
     * @memberof LocalClient
     */
    serverReconnect() {
        this.state.resend(this);
    }

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
    transformSelection(selection: Selection): Selection {
        return this.state.transformSelection(selection);
    }

    abstract sendOperation(revision: number, operation: TextOperation): void;
    abstract applyOperation(operation: TextOperation): void;
}
