import { RemoteClient } from '../../src/client/RemoteClient';
import { LocalClient } from '../../src/client/LocalClient';
import { Selection } from '../../src/operations/Selection';
import { TestServerAdapter } from './AbstractServerAdapter.test';
import { TestEditorAdapter } from './AbstractEditorAdapter.test';
import { TextOperation } from '../../src';
import { WrappedOperation } from '../../src/operations/WrappedOperation';
import { SelfSelection } from '../../src/operations/SelfSelection';

const createLocalClient = (revision: number = 0) => {
    return new LocalClient<number>(
        revision,
        [],
        new TestServerAdapter<number>(),
        new TestEditorAdapter<number>()
    );
};

describe('LocalClient', () => {
    describe('constructor', () => {
        it('should set attributes and call initializeClients', () => {
            const serverAdapter = new TestServerAdapter<number>();
            const editorAdapter = new TestEditorAdapter<number>();

            const client = new LocalClient<number>(
                7,
                [new RemoteClient<number>(13)],
                serverAdapter,
                editorAdapter
            );

            expect(client.revision).toBe(7);
            expect(client.serverAdapter).toBe(serverAdapter);
            expect(client.editorAdapter).toBe(editorAdapter);
            expect(client.clients.has(13)).toBe(true);

            expect(client.undoManager).toBeDefined();
            expect(client.clientsChanged).toBeDefined();
        });
    });

    describe('initializeClients', () => {
        it('should add given clients to client map', () => {
            const client = createLocalClient();
            const remoteClient = new RemoteClient(10);
            const onclientsChanged = jest.fn();
            client.clientsChanged.on(onclientsChanged);

            client.initializeClients([remoteClient]);

            expect(client.clients.get(10)).toBe(remoteClient);
            expect(remoteClient.editorAdapter).toBe(client.editorAdapter);
            expect(onclientsChanged).toHaveBeenCalledWith(client.clients);
        });
    });

    describe('setClients', () => {
        it('should call remove for old clients, add new clients and emit clientsChanged', () => {
            const client = createLocalClient();
            const onclientsChanged = jest.fn();
            client.clientsChanged.on(onclientsChanged);

            const oldClient = new RemoteClient(10);
            oldClient.remove = jest.fn();
            const newClient = new RemoteClient(11);
            client.addClient(oldClient);

            client.setClients([newClient]);

            expect(oldClient.remove).toHaveBeenCalledTimes(1);
            expect(onclientsChanged).toHaveBeenCalledWith(client.clients);
        });

        it('should transform selection against current client state', () => {
            const client = createLocalClient();
            client.transformSelection = jest.fn().mockImplementation(arg => arg);
            client.editorAdapter.setOtherSelection = jest.fn();

            const selection = new Selection([]);
            const remoteClient = new RemoteClient(1, 'name', selection);

            client.setClients([remoteClient]);

            expect(client.transformSelection).toHaveBeenCalledWith(selection);
            expect(client.clients.get(1)).toBe(remoteClient);
        });
    });

    describe('addClient', () => {
        it('should add client to clients map, call client.setEditorAdapter and emit clientsChanged', () => {
            const client = createLocalClient();
            const onclientsChanged = jest.fn();
            client.clientsChanged.on(onclientsChanged);

            const remoteClient = new RemoteClient(1);
            remoteClient.setEditorAdapter = jest.fn();

            client.addClient(remoteClient);
            expect(client.clients.get(1)).toBe(remoteClient);
            expect(remoteClient.setEditorAdapter).toHaveBeenCalledWith(client.editorAdapter);
            expect(onclientsChanged).toHaveBeenCalledWith(client.clients);
        });
    });

    describe('getClient', () => {
        it('should return existing RemoteClient from map', () => {
            const client = createLocalClient();
            client.editorAdapter.setOtherSelection = jest.fn();
            const remoteClient = new RemoteClient(1);
            client.addClient(remoteClient);

            expect(client.getClient(1)).toBe(remoteClient);
        });

        it('should return new RemoteClient when not found', () => {
            const client = createLocalClient();
            client.editorAdapter.setOtherSelection = jest.fn();

            expect(client.getClient(11)).toBeInstanceOf(RemoteClient);
        });
    });

    describe('setClientName', () => {
        it("should set client's name and emit clientsChanged", () => {
            const client = createLocalClient();
            client.editorAdapter.setOtherSelection = jest.fn();
            const onclientsChanged = jest.fn();
            client.clientsChanged.on(onclientsChanged);
            const remoteClient = new RemoteClient(1);
            client.addClient(remoteClient);

            client.setClientName(1, 'name');

            expect(client.clients.get(1).name).toBe('name');
            expect(onclientsChanged).toHaveBeenCalledWith(client.clients);
        });
    });

    describe('sendOperation', () => {
        it('should call serverAdapter.sendOperation', () => {
            const client = createLocalClient();
            client.serverAdapter.sendOperation = jest.fn();
            const operation = new TextOperation();

            client.sendOperation(1, operation);

            expect(client.serverAdapter.sendOperation).toBeCalledWith(
                1,
                operation,
                client.lastSelection
            );
        });
    });

    describe('applyOperation', () => {
        it('should call editorAdapter.applyOperation, updateSelection and undoManager.transforn', () => {
            const client = createLocalClient();
            client.editorAdapter.applyOperation = jest.fn();
            client.updateSelection = jest.fn();
            client.undoManager.transform = jest.fn();

            const operation = new TextOperation();

            client.applyOperation(operation);

            expect(client.editorAdapter.applyOperation).toBeCalledWith(operation);
            expect(client.updateSelection).toBeCalled();
            expect(client.undoManager.transform).toBeCalledWith(
                new WrappedOperation(operation, null)
            );
        });
    });

    describe('sendSelection', () => {
        it('should call serverAdapter.sendSelection', () => {
            const client = createLocalClient();
            client.serverAdapter.sendSelection = jest.fn();
            const selection = new Selection([]);

            client.sendSelection(selection);
            expect(client.serverAdapter.sendSelection).toBeCalledWith(selection);
            (client.serverAdapter.sendSelection as jest.Mock).mockClear();
            client.sendSelection(null);
            expect(client.serverAdapter.sendSelection).toBeCalledWith(null);
        });

        it('should not call serverAdapter.sendSelection in AwaitingWithBuffer state', () => {
            const client = createLocalClient();
            client.serverAdapter.sendSelection = jest.fn();
            client.serverAdapter.sendOperation = jest.fn();
            const selection = new Selection([]);

            const operation = new TextOperation();
            client.applyClient(operation);
            client.applyClient(operation);

            client.sendSelection(selection);

            expect(client.serverAdapter.sendSelection).not.toBeCalled();
        });
    });

    describe('updateSelection', () => {
        it('should call editorAdapter.getSelection and set lastSelection', () => {
            const client = createLocalClient();
            const selection = new Selection([]);
            client.editorAdapter.getSelection = jest.fn().mockReturnValue(selection);

            client.updateSelection();

            expect(client.editorAdapter.getSelection).toBeCalled();
            expect(client.lastSelection).toBe(selection);
        });
    });

    describe('applyUnredo', () => {
        it('should call undoManager.add on inverted operation, editorAdapter.applyOperation, editorAdapter.setSelection, applyClient and update lastSelection', () => {
            const client = createLocalClient();
            const operation = new TextOperation();
            const selectionBefore = Selection.createCursor(1);
            const selectionAfter = Selection.createCursor(2);
            const wrapped = new WrappedOperation(
                operation,
                new SelfSelection(selectionBefore, selectionAfter)
            );
            const wrappedWithoutSelection = new WrappedOperation(operation, null);

            wrapped.invert = jest.fn().mockReturnThis();
            client.undoManager.add = jest.fn();
            client.editorAdapter.applyOperation = jest.fn();
            client.editorAdapter.setSelection = jest.fn();
            client.editorAdapter.getValue = jest.fn().mockReturnValue('doc');
            client.applyClient = jest.fn();

            client.applyUnredo(wrapped);

            expect(client.editorAdapter.getValue).toBeCalled();
            expect(wrapped.invert).toBeCalledWith('doc');
            expect(client.undoManager.add).toBeCalledWith(wrapped);
            expect(client.editorAdapter.applyOperation).toBeCalledWith(operation);
            expect(client.editorAdapter.setSelection).toBeCalledWith(selectionAfter);
            expect(client.lastSelection).toBe(selectionAfter);

            client.applyUnredo(wrappedWithoutSelection);

            expect(client.lastSelection).toBeInstanceOf(Selection);
            expect(client.lastSelection.somethingSelected()).toBe(false);
        });
    });

    describe('onClientLeft', () => {
        it('should call remove on RemoteClient, delete client from clients map and emit clientsChanged', () => {
            const client = createLocalClient();
            const onclientsChanged = jest.fn();
            client.clientsChanged.on(onclientsChanged);
            const remoteClient = new RemoteClient(1);
            remoteClient.remove = jest.fn();

            client.onClientLeft(1);
            expect(onclientsChanged).not.toHaveBeenCalled();

            client.addClient(remoteClient);
            client.onClientLeft(1);
            expect(remoteClient.remove).toBeCalled();

            expect(onclientsChanged).toHaveBeenCalledWith(client.clients);
        });
    });

    describe('onReceivedOperation', () => {
        it('should call applyServer', () => {
            const client = createLocalClient();
            client.applyServer = jest.fn();
            const operation = new TextOperation();

            client.onReceivedOperation(operation);
            expect(client.applyServer).toBeCalledWith(operation);
        });
    });

    describe('onReceivedSelection', () => {
        it('should call updateSelection with transformed selection', () => {
            const selection = Selection.createCursor(1);
            const transformedSelection = Selection.createCursor(2);
            const remoteClient = new RemoteClient(1);
            remoteClient.updateSelection = jest.fn();
            remoteClient.removeSelection = jest.fn();
            const client = createLocalClient();
            client.getClient = jest.fn().mockReturnValueOnce(remoteClient);
            client.transformSelection = jest.fn().mockReturnValueOnce(transformedSelection);

            client.onReceivedSelection(1, selection);

            expect(client.getClient).toBeCalledWith(1);
            expect(client.transformSelection).toBeCalledWith(selection);
            expect(remoteClient.updateSelection).toBeCalledWith(transformedSelection);
            expect(remoteClient.removeSelection).not.toBeCalled();
        });

        it('should removeSelection if given null', () => {
            const remoteClient = new RemoteClient(1);
            remoteClient.updateSelection = jest.fn();
            remoteClient.removeSelection = jest.fn();
            const client = createLocalClient();
            client.getClient = jest.fn().mockReturnValueOnce(remoteClient);

            client.onReceivedSelection(1, null);

            expect(client.getClient).toBeCalledWith(1);
            expect(remoteClient.removeSelection).toBeCalled();
            expect(remoteClient.updateSelection).not.toBeCalled();
        });
    });

    describe('undo', () => {
        it('should check undoManager.canUndo, call undoManager.performUndo and applyUnredo in callback', () => {
            const client = createLocalClient();
            client.undoManager.canUndo = jest
                .fn()
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true);
            const operation = new WrappedOperation(
                new TextOperation(),
                new SelfSelection(new Selection([]), new Selection([]))
            );
            client.undoManager.performUndo = jest.fn(callback => callback(operation));
            client.applyUnredo = jest.fn();

            client.undo();
            client.undo();

            expect(client.undoManager.canUndo).toHaveBeenCalledTimes(2);
            expect(client.undoManager.performUndo).toHaveBeenCalledTimes(1);
            expect(client.applyUnredo).toHaveBeenLastCalledWith(operation);
        });
    });

    describe('redo', () => {
        it('should check undoManager.canRedo, call undoManager.performRedo and applyUnredo in callback', () => {
            const client = createLocalClient();
            client.undoManager.canRedo = jest
                .fn()
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true);
            const operation = new WrappedOperation(
                new TextOperation(),
                new SelfSelection(new Selection([]), new Selection([]))
            );
            client.undoManager.performRedo = jest.fn(callback => callback(operation));
            client.applyUnredo = jest.fn();

            client.redo();
            client.redo();

            expect(client.undoManager.canRedo).toHaveBeenCalledTimes(2);
            expect(client.undoManager.performRedo).toHaveBeenCalledTimes(1);
            expect(client.applyUnredo).toHaveBeenLastCalledWith(operation);
        });
    });

    describe('onChange', () => {
        it('should call updateSelection, undoManager.add and applyClient', () => {
            const client = createLocalClient();
            client.applyClient = jest.fn();
            client.undoManager.add = jest.fn();
            const oldSelection = client.lastSelection;
            const newSelection = Selection.createCursor(1);
            client.editorAdapter.getSelection = jest.fn().mockReturnValueOnce(newSelection);
            const operation = new TextOperation().insert('ab');
            const inverseOperation = new TextOperation().delete('ab');
            const wrapped = new WrappedOperation(
                inverseOperation,
                new SelfSelection(newSelection, oldSelection)
            );

            inverseOperation.shouldBeComposedWithInverted = jest.fn().mockReturnValue(true);

            client.onChange({ operation, inverseOperation });

            expect(client.editorAdapter.getSelection).toHaveBeenCalledTimes(1);
            expect(client.undoManager.add).toBeCalledWith(wrapped, false);
            expect(client.applyClient).toBeCalledWith(operation);
        });

        it('should set compose to true when inverseOperation.shouldBeComposedWithInverted is true', () => {
            const client = createLocalClient();
            client.applyClient = jest.fn();
            client.undoManager.add = jest.fn();
            const oldSelection = client.lastSelection;
            const newSelection = Selection.createCursor(1);
            client.editorAdapter.getSelection = jest.fn().mockReturnValueOnce(newSelection);
            const operation = new TextOperation().insert('ab');
            const inverseOperation = new TextOperation().delete('ab');
            const wrapped = new WrappedOperation(
                inverseOperation,
                new SelfSelection(newSelection, oldSelection)
            );

            inverseOperation.shouldBeComposedWithInverted = jest.fn().mockReturnValue(true);
            client.undoManager.undoStack.push(wrapped);

            client.onChange({ operation, inverseOperation });

            expect(inverseOperation.shouldBeComposedWithInverted).toBeCalledWith(wrapped.operation);
            expect(client.editorAdapter.getSelection).toHaveBeenCalledTimes(1);
            expect(client.undoManager.add).toBeCalledWith(wrapped, true);
            expect(client.applyClient).toBeCalledWith(operation);
        });
    });

    describe('onSelectionChange', () => {
        it('should call updateSelection and sendSelection if changed', () => {
            const client = createLocalClient();
            client.sendSelection = jest.fn();
            const newSelection = Selection.createCursor(1);
            const newSelection2 = Selection.createCursor(1);
            client.editorAdapter.getSelection = jest
                .fn()
                .mockReturnValueOnce(newSelection)
                .mockReturnValueOnce(newSelection2);

            client.onSelectionChange();
            expect(client.sendSelection).toBeCalledWith(newSelection);
            (client.sendSelection as jest.Mock).mockClear();

            client.onSelectionChange();
            expect(client.sendSelection).not.toBeCalledWith(newSelection);
            expect(client.editorAdapter.getSelection).toHaveBeenCalledTimes(2);
        });
    });

    describe('onBlur', () => {
        it('should call sendSelection with null and reset lastSelection', () => {
            const client = createLocalClient();
            client.lastSelection = Selection.createCursor(1);
            client.sendSelection = jest.fn();

            client.onBlur();

            expect(client.sendSelection).toBeCalledWith(null);
            expect(client.lastSelection).toEqual(new Selection([]));
        });
    });
});
