import { AbstractLocalClient } from './AbstractLocalClient';
import { Selection } from '../operations/Selection';
import { TextOperation } from '../operations/TextOperation';
import { RemoteClient } from './RemoteClient';
import { AbstractServerAdapter } from './AbstractServerAdapter';
import { AbstractEditorAdapter, Change } from './AbstractEditorAdapter';
import { UndoManager } from './UndoManager';
import { WrappedOperation } from '../operations/WrappedOperation';
import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';
export declare class LocalClient<TId> extends AbstractLocalClient {
    serverAdapter: AbstractServerAdapter<TId>;
    editorAdapter: AbstractEditorAdapter<TId>;
    undoManager: UndoManager;
    lastSelection: Selection;
    clients: Map<TId, RemoteClient<TId>>;
    clientsChanged: SimpleTypedEvent<Map<TId, RemoteClient<TId>>>;
    constructor(revision: number, clients: RemoteClient<TId>[], serverAdapter: AbstractServerAdapter<TId>, editorAdapter: AbstractEditorAdapter<TId>);
    addClient(client: RemoteClient<TId>): void;
    setClients(clients: RemoteClient<TId>[]): void;
    setClientName: (clientId: TId, name: string) => void;
    initializeClients(clients: RemoteClient<TId>[]): void;
    getClient(clientId: TId): RemoteClient<TId>;
    onClientLeft: (clientId: TId) => void;
    onReceivedOperation: (operation: TextOperation) => void;
    onReceivedSelection: (clientId: TId, selection: Selection | null) => void;
    applyUnredo(operation: WrappedOperation): void;
    undo: () => void;
    redo: () => void;
    onChange: ({ operation, inverseOperation }: Change) => void;
    updateSelection(): void;
    onSelectionChange: () => void;
    onBlur: () => void;
    sendSelection(selection: Selection | null): void;
    /**
     * Called by Client to send new operation to serverAdapter.
     * @param revision
     * @param operation
     */
    sendOperation(revision: number, operation: TextOperation): void;
    /**
     * Called by AbstractLocalClient state to apply operation to editorAdapter.
     * @param {TextOperation} operation
     */
    applyOperation(operation: TextOperation): void;
}
