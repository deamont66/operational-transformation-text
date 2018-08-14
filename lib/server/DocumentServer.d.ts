import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';
import { TextOperation } from '../operations/TextOperation';
import { WrappedOperation } from '../operations/WrappedOperation';
export declare abstract class DocumentServer {
    currentRevision: number;
    operationRecieved: SimpleTypedEvent<WrappedOperation>;
    constructor(revision?: number);
    abstract getOperationsAfterRevision(revisitionNumber: number): Promise<TextOperation[]>;
    receiveOperation(operationRevision: number, operation: WrappedOperation): Promise<WrappedOperation>;
    transformReceivedOperation(operationRevision: number, operation: WrappedOperation): Promise<WrappedOperation>;
    getRevision(): number;
}
