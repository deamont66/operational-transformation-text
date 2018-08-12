import { AbstractLocalClient } from './AbstractLocalClient';
import { Selection } from '../operations/Selection';
import { TextOperation } from '../operations/TextOperation';
import { RemoteClient } from './RemoteClient';
import { AbstractServerAdapter } from './AbstractServerAdapter';
import { AbstractEditorAdapter, Change } from './AbstractEditorAdapter';
import { UndoManager } from './UndoManager';
import { WrappedOperation } from '../operations/WrappedOperation';
import { AwaitingWithBuffer } from './ClientState';
import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';
import { SelfSelection } from '../operations/SelfSelection';

export class LocalClient<TId> extends AbstractLocalClient {
    serverAdapter: AbstractServerAdapter<TId>;
    editorAdapter: AbstractEditorAdapter<TId>;
    undoManager: UndoManager;
    lastSelection: Selection;
    clients: Map<TId, RemoteClient<TId>>;

    clientsChanged = new SimpleTypedEvent<Map<TId, RemoteClient<TId>>>();

    constructor(
        revision: number,
        clients: RemoteClient<TId>[],
        serverAdapter: AbstractServerAdapter<TId>,
        editorAdapter: AbstractEditorAdapter<TId>
    ) {
        super(revision);

        this.serverAdapter = serverAdapter;
        this.editorAdapter = editorAdapter;
        this.undoManager = new UndoManager();
        this.lastSelection = new Selection([]);
        this.clients = new Map<TId, RemoteClient<TId>>();

        this.initializeClients(clients);

        this.editorAdapter.change.on(this.onChange);

        this.editorAdapter.selectionChange.on(this.onSelectionChange);
        this.editorAdapter.blur.on(this.onBlur);
        this.editorAdapter.undo.on(this.undo);
        this.editorAdapter.redo.on(this.redo);

        this.serverAdapter.clientLeft.on(this.onClientLeft);
        this.serverAdapter.clientNameChange.on(this.setClientName);
        this.serverAdapter.operationAck.on(this.serverAck);
        this.serverAdapter.operationRecieved.on(this.onReceivedOperation);
        this.serverAdapter.selectionRecieved.on(this.onReceivedSelection);
    }

    addClient(client: RemoteClient<TId>) {
        client.setEditorAdapter(this.editorAdapter);
        this.clients.set(client.id, client);
        this.clientsChanged.emit(this.clients);
    }

    setClients(clients: RemoteClient<TId>[]) {
        this.clients.forEach(client => {
            client.remove();
        });
        this.clients.clear();

        const newClients = new Map<TId, RemoteClient<TId>>();
        clients.forEach(client => {
            if (client.lastSelection) {
                const selection = this.transformSelection(client.lastSelection);
                client.updateSelection(selection);
            }
            client.setEditorAdapter(this.editorAdapter);
            newClients.set(client.id, client);
        });

        this.clients = newClients;
        this.clientsChanged.emit(this.clients);
    }

    setClientName = (clientId: TId, name: string) => {
        let client = this.getClient(clientId);
        client.setName(name);
        this.clientsChanged.emit(this.clients);
    };

    initializeClients(clients: RemoteClient<TId>[]) {
        this.clients.clear();

        clients.forEach(client => {
            client.setEditorAdapter(this.editorAdapter);
            this.clients.set(client.id, client);
        });
        this.clientsChanged.emit(this.clients);
    }

    getClient(clientId: TId): RemoteClient<TId> {
        let client = this.clients.get(clientId);
        if (!client) {
            client = new RemoteClient(clientId);
            client.setEditorAdapter(this.editorAdapter);
            this.clients.set(clientId, client);
        }
        return client;
    }

    onClientLeft = (clientId: TId) => {
        const client = this.clients.get(clientId);
        if (!client) {
            return;
        }
        client.remove();
        this.clients.delete(clientId);
        this.clientsChanged.emit(this.clients);
    };

    onReceivedOperation = (operation: TextOperation) => {
        this.applyServer(operation);
    };

    onReceivedSelection = (clientId: TId, selection: Selection | null) => {
        if (selection) {
            this.getClient(clientId).updateSelection(this.transformSelection(selection));
        } else {
            this.getClient(clientId).removeSelection();
        }
    };

    applyUnredo(operation: WrappedOperation) {
        this.undoManager.add(operation.invert(this.editorAdapter.getValue()));
        this.editorAdapter.applyOperation(operation.operation);
        this.lastSelection = operation.selection
            ? operation.selection.selectionAfter
            : new Selection([]);
        this.editorAdapter.setSelection(this.lastSelection);
        this.applyClient(operation.operation);
    }

    undo = () => {
        if (!this.undoManager.canUndo()) {
            return;
        }
        this.undoManager.performUndo(o => {
            this.applyUnredo(o);
        });
    };

    redo = () => {
        if (!this.undoManager.canRedo()) {
            return;
        }
        this.undoManager.performRedo(o => {
            this.applyUnredo(o);
        });
    };

    onChange = ({ operation, inverseOperation }: Change) => {
        const selectionBefore = this.lastSelection;
        this.updateSelection();

        const compose =
            this.undoManager.undoStack.length > 0 &&
            inverseOperation.shouldBeComposedWithInverted(
                this.undoManager.undoStack[this.undoManager.undoStack.length - 1].operation
            );
        const inverseMeta = new SelfSelection(this.lastSelection, selectionBefore);
        this.undoManager.add(new WrappedOperation(inverseOperation, inverseMeta), compose);
        this.applyClient(operation);
    };

    updateSelection() {
        this.lastSelection = this.editorAdapter.getSelection();
    }

    onSelectionChange = () => {
        const oldSelection = this.lastSelection;
        this.updateSelection();
        if (oldSelection && this.lastSelection.equals(oldSelection)) {
            return;
        }
        this.sendSelection(this.lastSelection);
    };

    onBlur = () => {
        this.lastSelection = new Selection([]);
        this.sendSelection(null);
    };

    sendSelection(selection: Selection | null) {
        if (this.state instanceof AwaitingWithBuffer) {
            return;
        }
        this.serverAdapter.sendSelection(selection);
    }

    /**
     * Called by Client to send new operation to serverAdapter.
     * @param revision
     * @param operation
     */
    sendOperation(revision: number, operation: TextOperation) {
        this.serverAdapter.sendOperation(revision, operation, this.lastSelection);
    }

    /**
     * Called by AbstractLocalClient state to apply operation to editorAdapter.
     * @param {TextOperation} operation
     */
    applyOperation(operation: TextOperation) {
        this.editorAdapter.applyOperation(operation);
        this.updateSelection();
        this.undoManager.transform(new WrappedOperation(operation, null));
    }
}
