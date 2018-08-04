import { TextOperation } from '../operations/TextOperation';
import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';
export declare abstract class DocumentServer {
    currentRevision: number;
    recievedOperation: SimpleTypedEvent<TextOperation>;
    constructor(revision?: number);
    abstract getOperationsAfterRevision(revisitionNumber: number): TextOperation[];
    receiveOperation(operationRevision: number, operation: TextOperation): TextOperation;
    private transformReceivedOperation;
    getRevision(): number;
}
