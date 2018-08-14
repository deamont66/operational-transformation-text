import { DocumentServer } from '../../src/server/DocumentServer';
import { TextOperation } from '../../src/operations/TextOperation';
import { WrappedOperation } from '../../src/operations/WrappedOperation';

class TestDocumentServer extends DocumentServer {
    getOperationsAfterRevision(revisitionNumber: number): Promise<TextOperation[]> {
        throw new Error('Not implemented in test implementation');
    }
}

describe('DocumentServer constructor', () => {
    it('should set default revision number', () => {
        const server = new TestDocumentServer();
        expect(server.currentRevision).toBe(0);
    });

    it('should set given revision number', () => {
        const server = new TestDocumentServer(5);
        expect(server.currentRevision).toBe(5);
    });
});

describe('DocumentServer getRevision', () => {
    it('should return revision number', () => {
        const server = new TestDocumentServer(5);
        expect(server.getRevision()).toBe(5);
    });
});

describe('DocumentServer receiveOperation', () => {
    it('should call transformReceivedOperation and emit event', async () => {
        const server = new TestDocumentServer(5);

        const operation = new TextOperation().retain(5);
        const wrappedOperation = new WrappedOperation(operation, null);
        const retOperation = new TextOperation().insert('a');
        const retWrappedOperation = new WrappedOperation(retOperation, null);
        server.transformReceivedOperation = jest.fn().mockResolvedValue(retWrappedOperation);
        server.operationRecieved.emit = jest.fn();

        const result = await server.receiveOperation(5, wrappedOperation);
        expect(server.transformReceivedOperation).toBeCalledWith(5, wrappedOperation);
        expect(server.operationRecieved.emit).toBeCalledWith(retWrappedOperation);
        expect(result).toBe(retWrappedOperation);
    });
});

describe('DocumentServer transformReceivedOperation', () => {
    it('should call getOperationsAfterRevision and TextOperation.transform', async () => {
        const server = new TestDocumentServer(5);

        const operation = new WrappedOperation(new TextOperation().retain(1), null);
        const concurrentOperations = [new TextOperation().delete(1)];
        const retOperation = new WrappedOperation(new TextOperation().insert('a'), null);

        server.getOperationsAfterRevision = jest.fn().mockResolvedValue(concurrentOperations);
        WrappedOperation.transform = jest.fn().mockReturnValue([retOperation]);

        const result = await server.transformReceivedOperation(5, operation);
        expect(server.getOperationsAfterRevision).toBeCalledWith(5);
        expect(WrappedOperation.transform).toBeCalledWith(
            operation,
            new WrappedOperation(concurrentOperations[0], null)
        );
        expect(result).toBe(retOperation);
    });
});
