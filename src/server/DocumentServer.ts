import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';
import { TextOperation } from '../operations/TextOperation';
import { WrappedOperation } from '../operations/WrappedOperation';

export abstract class DocumentServer {
    currentRevision: number;
    operationRecieved = new SimpleTypedEvent<WrappedOperation>();

    constructor(revision: number = 0) {
        this.currentRevision = revision;
    }

    abstract getOperationsAfterRevision(revisitionNumber: number): Promise<TextOperation[]>;

    async receiveOperation(
        operationRevision: number,
        operation: WrappedOperation
    ): Promise<WrappedOperation> {
        const transformedOperation = await this.transformReceivedOperation(
            operationRevision,
            operation
        );
        this.operationRecieved.emit(transformedOperation);
        return transformedOperation;
    }

    async transformReceivedOperation(
        operationRevision: number,
        operation: WrappedOperation
    ): Promise<WrappedOperation> {
        // Find all operations that the client didn't know of when it sent the
        // operation ...
        const concurrentOperations = await this.getOperationsAfterRevision(operationRevision);
        // ... and transform the operation against all these operations.
        for (let i = 0; i < concurrentOperations.length; i++) {
            [operation] = WrappedOperation.transform(
                operation,
                new WrappedOperation(concurrentOperations[i], null)
            );
        }
        return operation;
    }

    getRevision(): number {
        return this.currentRevision;
    }
}
