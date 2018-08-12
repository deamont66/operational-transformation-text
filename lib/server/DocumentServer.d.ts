import { TextOperation } from '../operations/TextOperation';
import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';
export declare abstract class DocumentServer {
    currentRevision: number;
    operationRecieved: SimpleTypedEvent<TextOperation>;
    constructor(revision?: number);
    abstract getOperationsAfterRevision(revisitionNumber: number): TextOperation[];
    receiveOperation(operationRevision: number, operation: TextOperation): TextOperation;
    transformReceivedOperation(operationRevision: number, operation: TextOperation): TextOperation;
    getRevision(): number;
}
