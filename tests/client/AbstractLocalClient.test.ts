import { AbstractLocalClient } from '../../src/client/AbstractLocalClient';
import { TextOperation } from '../../src';
import { Synchronized, AwaitingConfirm } from '../../src/client/ClientState';
import { Selection } from '../../src/operations/Selection';

export class TestLocalClient extends AbstractLocalClient {
    sendOperation(revision: number, operation: TextOperation): void {
        throw new Error('Not implemented in test implementation');
    }

    applyOperation(operation: TextOperation): void {
        throw new Error('Not implemented in test implementation');
    }
}

describe('TestLocalClient', () => {
    describe('constructor', () => {
        it('should set given revision number and Synchronized state', () => {
            const client = new TestLocalClient(5);
            expect(client.revision).toBe(5);
            expect(client.state).toBeInstanceOf(Synchronized);
        });
    });

    describe('setState', () => {
        it('should set given state', () => {
            const state = new AwaitingConfirm(new TextOperation());

            const client = new TestLocalClient(5);
            client.setState(state);

            expect(client.state).toBe(state);
        });
    });

    describe('applyClient', () => {
        it('should call state.applyClient and set new returned state', () => {
            const operation = new TextOperation().retain(1);
            const state = new AwaitingConfirm(operation);

            const client = new TestLocalClient(5);
            client.state.applyClient = jest.fn().mockReturnValue(state);
            client.setState = jest.fn();

            client.applyClient(operation);

            expect(client.state.applyClient).toBeCalledWith(client, operation);
            expect(client.setState).toBeCalledWith(state);
        });
    });

    describe('applyServer', () => {
        it('should increase revision and call state.applyServer and set new returned state', () => {
            const operation = new TextOperation().retain(1);
            const state = new AwaitingConfirm(operation);

            const client = new TestLocalClient(5);
            client.state.applyServer = jest.fn().mockReturnValue(state);
            client.setState = jest.fn();

            client.applyServer(operation);

            expect(client.revision).toBe(6);
            expect(client.state.applyServer).toBeCalledWith(client, operation);
            expect(client.setState).toBeCalledWith(state);
        });
    });

    describe('serverAck', () => {
        it('should increase revision and call state.serverAck and set new returned state', () => {
            const operation = new TextOperation().retain(1);
            const state = new AwaitingConfirm(operation);

            const client = new TestLocalClient(5);
            client.state.serverAck = jest.fn().mockReturnValue(state);
            client.setState = jest.fn();

            client.serverAck();

            expect(client.revision).toBe(6);
            expect(client.state.serverAck).toBeCalledWith(client);
            expect(client.setState).toBeCalledWith(state);
        });
    });

    describe('serverReconnect', () => {
        it('should call state.resend', () => {
            const client = new TestLocalClient(5);
            client.state.resend = jest.fn();

            client.serverReconnect();

            expect(client.state.resend).toBeCalledWith(client);
        });
    });

    describe('transformSelection', () => {
        it('should call and return state.transformSelection', () => {
            const selection = Selection.createCursor(1);
            const retSelection = Selection.createCursor(2);
            const client = new TestLocalClient(5);
            client.state.transformSelection = jest.fn().mockReturnValue(retSelection);

            const retVal = client.transformSelection(selection);

            expect(client.state.transformSelection).toBeCalledWith(selection);
            expect(retVal).toBeInstanceOf(Selection);
            expect(retVal).toBe(retSelection);
        });
    });
});
