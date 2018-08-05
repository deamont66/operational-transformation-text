import { TextOperation } from '../operations/TextOperation';
import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';

export abstract class DocumentServer {
    currentRevision: number;
    operationRecieved = new SimpleTypedEvent<TextOperation>();

    constructor(revision: number = 0) {
        this.currentRevision = revision;
    }

    abstract getOperationsAfterRevision(revisitionNumber: number): TextOperation[];

    receiveOperation(operationRevision: number, operation: TextOperation): TextOperation {
        const transformedOperation = this.transformReceivedOperation(operationRevision, operation);
        this.operationRecieved.emit(transformedOperation);
        return transformedOperation;
    }

    transformReceivedOperation(operationRevision: number, operation: TextOperation): TextOperation {
        // Find all operations that the client didn't know of when it sent the
        // operation ...
        const concurrentOperations = this.getOperationsAfterRevision(operationRevision);
        // ... and transform the operation against all these operations.
        for (let i = 0; i < concurrentOperations.length; i++) {
            [operation] = TextOperation.transform(operation, concurrentOperations[i]);
        }
        return operation;
    }

    getRevision(): number {
        return this.currentRevision;
    }
}
