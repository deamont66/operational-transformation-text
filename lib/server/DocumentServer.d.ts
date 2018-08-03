import { TextOperation } from '../operations/TextOperation';
import { TypedEvent } from '../utils/TypedEvent';
export declare abstract class DocumentServer {
    currentRevision: number;
    recievedOperation: TypedEvent<TextOperation>;
    constructor(revision?: number);
    abstract getOperationsAfterRevision(revisitionNumber: number): TextOperation[];
    receiveOperation(operationRevision: number, operation: TextOperation): TextOperation;
    private transformReceivedOperation;
    getRevision(): number;
}
