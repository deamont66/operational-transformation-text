import { AbstractLocalClient } from '../../src/client/AbstractLocalClient';
import {
    Synchronized,
    AwaitingConfirm,
    ClientState,
    AwaitingWithBuffer
} from '../../src/client/ClientState';
import { TextOperation } from '../../src';
import { Selection } from '../../src/operations/Selection';

class TestLocalClient extends AbstractLocalClient {
    sendOperation(revision: number, operation: TextOperation): void {
        throw new Error('Not implemented in test implementation');
    }

    applyOperation(operation: TextOperation): void {
        throw new Error('Not implemented in test implementation');
    }
}

describe('Synchronized', () => {
    describe('applyClient', () => {
        it('should call client.sendOpration and return AwaitingState', () => {
            const client = new TestLocalClient(7);
            client.sendOperation = jest.fn();
            const operation = new TextOperation().retain(1);

            const state: ClientState = new Synchronized();
            const retVal = state.applyClient(client, operation);

            expect(client.sendOperation).toBeCalledWith(7, operation);
            expect(retVal).toBeInstanceOf(AwaitingConfirm);
            expect((retVal as AwaitingConfirm).outstanding).toBe(operation);
        });
    });

    describe('applyServer', () => {
        it('should call client.applyOperation and return this', () => {
            const client = new TestLocalClient(7);
            client.applyOperation = jest.fn();
            const operation = new TextOperation().retain(1);

            const state = new Synchronized();
            const retVal = state.applyServer(client, operation);

            expect(client.applyOperation).toBeCalledWith(operation);
            expect(retVal).toBeInstanceOf(Synchronized);
            expect(retVal).toBe(state);
        });
    });

    describe('serverAck', () => {
        it('should throw error', () => {
            const client = new TestLocalClient(7);
            client.applyOperation = jest.fn();

            const state: ClientState = new Synchronized();
            expect(() => state.serverAck(client)).toThrow(/no pending operation/);
        });
    });

    describe('transformSelection', () => {
        it('should return given selection', () => {
            const selection = Selection.createCursor(4);

            const state: ClientState = new Synchronized();
            const retVal = state.transformSelection(selection);
            expect(retVal).toBeInstanceOf(Selection);
            expect(retVal).toBe(selection);
        });
    });

    describe('resend', () => {
        it('should not call sendOperation', () => {
            const client = new TestLocalClient(7);
            client.sendOperation = jest.fn();

            const state: ClientState = new Synchronized();
            state.resend(client);

            expect(client.sendOperation).not.toBeCalled();
        });
    });
});

describe('AwaitingConfirm', () => {
    describe('constructor', () => {
        it('should set given outstanding operation', () => {
            const operation = new TextOperation().retain(1);
            const state = new AwaitingConfirm(operation);
            expect(state.outstanding).toBe(operation);
        });
    });

    describe('applyClient', () => {
        it('should not call client.sendOperation and return new AwaitingWithBuffer', () => {
            const client = new TestLocalClient(7);
            client.sendOperation = jest.fn();
            const operation = new TextOperation().retain(1);
            const nextOperation = new TextOperation().retain(2);

            const state: ClientState = new AwaitingConfirm(operation);
            const retVal = state.applyClient(client, nextOperation);

            expect(client.sendOperation).not.toBeCalled();
            expect(retVal).toBeInstanceOf(AwaitingWithBuffer);
            expect((retVal as AwaitingWithBuffer).outstanding).toBe(operation);
            expect((retVal as AwaitingWithBuffer).buffer).toBe(nextOperation);
        });
    });

    describe('applyServer', () => {
        it('should call TextOperaion.transform, client.applyOperation and return new AwaitingConfirm', () => {
            const client = new TestLocalClient(7);
            client.applyOperation = jest.fn();
            const operation = new TextOperation().retain(1);
            const nextOperation = new TextOperation().retain(2);
            const transformedOperations = [
                new TextOperation().retain(3),
                new TextOperation().retain(4)
            ];
            TextOperation.transform = jest.fn().mockReturnValue(transformedOperations);
            const state = new AwaitingConfirm(operation);
            const retVal = state.applyServer(client, nextOperation);

            expect(TextOperation.transform).toBeCalledWith(operation, nextOperation);
            expect(client.applyOperation).toBeCalledWith(transformedOperations[1]);
            expect(retVal).toBeInstanceOf(AwaitingConfirm);
            expect((retVal as AwaitingConfirm).outstanding).toBe(transformedOperations[0]);
        });
    });

    describe('serverAck', () => {
        it('should return Synchronized', () => {
            const client = new TestLocalClient(7);
            const operation = new TextOperation().retain(1);

            const state: ClientState = new AwaitingConfirm(operation);
            const retVal = state.serverAck(client);

            expect(retVal).toBeInstanceOf(Synchronized);
        });
    });

    describe('transformSelection', () => {
        it('should call selection.transform', () => {
            const operation = new TextOperation().retain(1);
            const transformedSelection = Selection.createCursor(5);
            const selection = Selection.createCursor(4);
            selection.transform = jest.fn().mockReturnValue(transformedSelection);

            const state: ClientState = new AwaitingConfirm(operation);
            const retVal = state.transformSelection(selection);

            expect(selection.transform).toBeCalledWith(operation);
            expect(retVal).toBeInstanceOf(Selection);
            expect(retVal).toBe(transformedSelection);
        });
    });

    describe('resend', () => {
        it('should call sendOperation with outstanding', () => {
            const client = new TestLocalClient(7);
            const operation = new TextOperation().retain(1);
            client.sendOperation = jest.fn();

            const state: ClientState = new AwaitingConfirm(operation);
            state.resend(client);

            expect(client.sendOperation).toBeCalledWith(7, operation);
        });
    });
});

describe('AwaitingWithBuffer', () => {
    describe('constructor', () => {
        it('should set given outstanding operation and buffer', () => {
            const outstanding = new TextOperation().retain(1);
            const buffer = new TextOperation().retain(2);
            const state = new AwaitingWithBuffer(outstanding, buffer);
            expect(state.outstanding).toBe(outstanding);
            expect(state.buffer).toBe(buffer);
        });
    });

    describe('applyClient', () => {
        it('should call buffer.compose and return new AwaitingWithBuffer', () => {
            const client = new TestLocalClient(7);
            client.sendOperation = jest.fn();
            const outstanding = new TextOperation().retain(1);
            const buffer = new TextOperation().retain(2);
            const nextOperation = new TextOperation().retain(3);
            const nextBuffer = new TextOperation().retain(4);
            buffer.compose = jest.fn().mockReturnValue(nextBuffer);

            const state: ClientState = new AwaitingWithBuffer(outstanding, buffer);
            const retVal = state.applyClient(client, nextOperation);

            expect(buffer.compose).toBeCalledWith(nextOperation);

            expect(retVal).toBeInstanceOf(AwaitingWithBuffer);
            expect((retVal as AwaitingWithBuffer).outstanding).toBe(outstanding);
            expect((retVal as AwaitingWithBuffer).buffer).toBe(nextBuffer);
        });
    });

    describe('applyServer', () => {
        it('should call TextOperaion.transform for both outstanding and buffer, client.applyOperation and return new AwaitingWithBuffer', () => {
            const client = new TestLocalClient(7);
            client.applyOperation = jest.fn();
            const outstanding = new TextOperation().retain(1);
            const buffer = new TextOperation().retain(2);
            const nextOperation = new TextOperation().retain(3);
            const firstTransformedOperations = [
                new TextOperation().retain(3),
                new TextOperation().retain(4)
            ];
            const secondTransformedOperations = [
                new TextOperation().retain(3),
                new TextOperation().retain(4)
            ];
            TextOperation.transform = jest
                .fn()
                .mockReturnValueOnce(firstTransformedOperations)
                .mockReturnValueOnce(secondTransformedOperations);

            const state = new AwaitingWithBuffer(outstanding, buffer);
            const retVal = state.applyServer(client, nextOperation);

            expect(TextOperation.transform).toHaveBeenNthCalledWith(1, outstanding, nextOperation);
            expect(TextOperation.transform).toHaveBeenNthCalledWith(
                2,
                buffer,
                firstTransformedOperations[1]
            );
            expect(client.applyOperation).toHaveBeenCalledWith(secondTransformedOperations[1]);
            expect(retVal).toBeInstanceOf(AwaitingWithBuffer);
            expect((retVal as AwaitingWithBuffer).outstanding).toBe(firstTransformedOperations[0]);
            expect((retVal as AwaitingWithBuffer).buffer).toBe(secondTransformedOperations[0]);
        });
    });

    describe('serverAck', () => {
        it('should send buffer return new AwaitingConfirm', () => {
            const client = new TestLocalClient(7);
            const outstanding = new TextOperation().retain(1);
            const buffer = new TextOperation().retain(2);
            client.sendOperation = jest.fn();

            const state: ClientState = new AwaitingWithBuffer(outstanding, buffer);
            const retVal = state.serverAck(client);

            expect(client.sendOperation).toBeCalledWith(7, buffer);
            expect(retVal).toBeInstanceOf(AwaitingConfirm);
            expect((retVal as AwaitingConfirm).outstanding).toBe(buffer);
        });
    });

    describe('transformSelection', () => {
        it('should call selection.transform().transform', () => {
            const outstanding = new TextOperation().retain(1);
            const buffer = new TextOperation().retain(2);
            const selection = Selection.createCursor(5);
            const hiddenSelection = Selection.createCursor(6);
            const retSelection = Selection.createCursor(7);
            selection.transform = jest.fn().mockReturnValue(hiddenSelection);
            hiddenSelection.transform = jest.fn().mockReturnValue(retSelection);

            const state: ClientState = new AwaitingWithBuffer(outstanding, buffer);
            const retVal = state.transformSelection(selection);

            expect(selection.transform).toBeCalledWith(outstanding);
            expect(hiddenSelection.transform).toBeCalledWith(buffer);
            expect(retVal).toBeInstanceOf(Selection);
            expect(retVal).toBe(retSelection);
        });
    });

    describe('resend', () => {
        it('should call sendOperation with outstanding', () => {
            const client = new TestLocalClient(7);
            const outstanding = new TextOperation().retain(1);
            const buffer = new TextOperation().retain(2);
            client.sendOperation = jest.fn();

            const state: ClientState = new AwaitingWithBuffer(outstanding, buffer);
            state.resend(client);

            expect(client.sendOperation).toBeCalledWith(7, outstanding);
        });
    });
});
