import { DocumentServer } from '../../src/server/DocumentServer';
import { TextOperation } from '../../src/operations/TextOperation';

jest.mock('../../src/operations/TextOperation');
jest.mock('../../src/utils/SimpleTypedEvent');

class TestDocumentServer extends DocumentServer {
    getOperationsAfterRevision(revisitionNumber: number): TextOperation[] {
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
    it('should call transformReceivedOperation and emit event', () => {
        const server = new TestDocumentServer(5);

        const operation = new TextOperation().retain(5);
        const retOperation = new TextOperation().insert('a');
        server.transformReceivedOperation = jest.fn().mockReturnValueOnce(retOperation);
        server.operationRecieved.emit = jest.fn();

        const result = server.receiveOperation(5, operation);
        expect(server.transformReceivedOperation).toBeCalledWith(5, operation);
        expect(server.operationRecieved.emit).toBeCalledWith(retOperation);
        expect(result).toBe(retOperation);
    });
});

describe('DocumentServer transformReceivedOperation', () => {
    it('should call getOperationsAfterRevision and TextOperation.transform', () => {
        const server = new TestDocumentServer(5);

        const operation = new TextOperation().retain(1);
        const concurrentOperations = [new TextOperation().delete(1)];
        const retOperation = new TextOperation().insert('a');

        server.getOperationsAfterRevision = jest.fn().mockReturnValueOnce(concurrentOperations);
        TextOperation.transform = jest.fn().mockReturnValue([retOperation]);

        const result = server.transformReceivedOperation(5, operation);
        expect(server.getOperationsAfterRevision).toBeCalledWith(5);
        expect(TextOperation.transform).toBeCalledWith(operation, concurrentOperations[0]);
        expect(result).toBe(retOperation);
    });
});
