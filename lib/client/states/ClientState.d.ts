import { AbstractLocalClient } from '../AbstractLocalClient';
import { TextOperation } from '../../operations/TextOperation';
import { Selection } from '../../operations/Selection';
export interface ClientState {
    applyClient(client: AbstractLocalClient, operation: TextOperation): ClientState;
    applyServer(client: AbstractLocalClient, operation: TextOperation): ClientState;
    serverAck(client: AbstractLocalClient): ClientState;
    transformSelection(selection: Selection): Selection;
    resend(client: AbstractLocalClient): void;
}
export declare class Synchronized implements ClientState {
    applyClient(client: AbstractLocalClient, operation: TextOperation): ClientState;
    applyServer(client: AbstractLocalClient, operation: TextOperation): ClientState;
    serverAck(client: AbstractLocalClient): ClientState;
    transformSelection(selection: Selection): Selection;
    resend(): void;
}
export declare const synchronizedInstance: Synchronized;
export declare class AwaitingConfirm implements ClientState {
    outstanding: TextOperation;
    constructor(outstanding: TextOperation);
    applyClient(client: AbstractLocalClient, operation: TextOperation): AwaitingWithBuffer;
    applyServer(client: AbstractLocalClient, operation: TextOperation): ClientState;
    serverAck(client: AbstractLocalClient): Synchronized;
    transformSelection(selection: Selection): Selection;
    resend(client: AbstractLocalClient): void;
}
export declare class AwaitingWithBuffer implements ClientState {
    outstanding: TextOperation;
    buffer: TextOperation;
    constructor(outstanding: TextOperation, buffer: TextOperation);
    applyClient(client: AbstractLocalClient, operation: TextOperation): AwaitingWithBuffer;
    applyServer(client: AbstractLocalClient, operation: TextOperation): AwaitingWithBuffer;
    serverAck(client: AbstractLocalClient): AwaitingConfirm;
    transformSelection(selection: Selection): Selection;
    resend(client: AbstractLocalClient): void;
}
