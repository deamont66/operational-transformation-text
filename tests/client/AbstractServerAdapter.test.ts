import { AbstractServerAdapter } from '../../src/client/AbstractServerAdapter';
import { TextOperation } from '../../src/operations/TextOperation';
import { Selection } from '../../src/operations/Selection';

class TestServerAdapter<TClient> extends AbstractServerAdapter<TClient> {
    /**
     * Gets called for emitting new Operation to server.
     *
     * @param {Number} revision - last received revision number
     * @param {Operation} operation - operation
     * @param {Selection} selection - meta selection data
     */
    sendOperation(revision: number, operation: TextOperation, selection: Selection): void {
        throw new Error('Method not implemented.');
    }

    /**
     * Gets called for emitting new Selection to server.
     *
     * @param {Selection} selection
     */
    sendSelection(selection: Selection): void {
        throw new Error('Method not implemented.');
    }
}

describe('AbstractServerAdapter', () => {
    it('should have all events', () => {
        const adapter = new TestServerAdapter<string>();
        expect(adapter.clientLeft).toBeDefined();
        expect(adapter.clientNameChange).toBeDefined();
        expect(adapter.operationAck).toBeDefined();
        expect(adapter.operationRecieved).toBeDefined();
        expect(adapter.selectionRecieved).toBeDefined();
    });
});
