import { RemoteClient } from '../../src/client/RemoteClient';
import { TestEditorAdapter } from './AbstractEditorAdapter.test';
import { Selection } from '../../src/operations/Selection';

describe('RemoteClient', () => {
    describe('constructor', () => {
        it('should set given id, editorAdapter, name and selection', () => {
            const id = 5;
            const editorAdapter = new TestEditorAdapter<number>();
            const name = 'some_name';
            const selection = Selection.createCursor(2);

            editorAdapter.setOtherSelection = jest.fn().mockReturnValue('markHandler');

            const client = new RemoteClient<number>(id, editorAdapter, name, selection);

            expect(client.id).toBe(id);
            expect(client.editorAdapter).toBe(editorAdapter);
            expect(client.name).toBe(name);
            expect(editorAdapter.setOtherSelection).toBeCalledWith(client, selection);
            expect(client.selectionEditorHandler).toBe('markHandler');
            expect(client.lastSelection).toBe(selection);
        });

        it('should set given id, editorAdapter, default name and default selection', () => {
            const id = 5;
            const editorAdapter = new TestEditorAdapter<number>();

            editorAdapter.setOtherSelection = jest.fn().mockReturnValue('markHandler');

            const client = new RemoteClient<number>(id, editorAdapter);

            expect(client.id).toBe(id);
            expect(client.editorAdapter).toBe(editorAdapter);
            expect(client.name).toBe('');
            expect(editorAdapter.setOtherSelection).not.toBeCalled();
            expect(client.selectionEditorHandler).toBe(null);
            expect(client.lastSelection).toBe(null);
        });
    });

    describe('setName', () => {
        it('should set name and call updateSelection with lastSelection if any', () => {
            const id = 5;
            const editorAdapter = new TestEditorAdapter<number>();
            const selection = Selection.createCursor(2);
            editorAdapter.setOtherSelection = jest.fn().mockReturnValue('markHandler');

            const client = new RemoteClient<number>(id, editorAdapter);
            client.updateSelection = jest.fn();

            let newName = 'new client name';
            client.setName(newName);

            expect(client.name).toBe(newName);
            expect(client.updateSelection).not.toBeCalled();

            client.lastSelection = selection;
            newName = 'even newer client name';
            client.setName(newName);

            expect(client.name).toBe(newName);
            expect(client.updateSelection).toBeCalledWith(selection);
        });

        it('should call updateSelection only when different from current', () => {
            const id = 5;
            const editorAdapter = new TestEditorAdapter<number>();
            const name = 'some_name';
            const selection = Selection.createCursor(2);
            editorAdapter.setOtherSelection = jest.fn().mockReturnValue('markHandler');

            const client = new RemoteClient<number>(id, editorAdapter, name, selection);
            client.updateSelection = jest.fn();

            client.setName(name);

            expect(client.name).toBe(name);
            expect(client.updateSelection).not.toBeCalled();
        });
    });

    describe('removeSelection', () => {
        it('should call set lastSelection and selectionEditorHandler to null', () => {
            const id = 5;
            const editorAdapter = new TestEditorAdapter<number>();
            const name = 'some_name';
            const selection = Selection.createCursor(2);
            editorAdapter.setOtherSelection = jest.fn().mockReturnValue('markHandler');

            const client = new RemoteClient<number>(id, editorAdapter, name, selection);
            client.removeSelection();

            expect(client.lastSelection).toBe(null);
            expect(client.selectionEditorHandler).toBe(null);
        });

        it('should call selectionEditorHandler.clear if exists', () => {
            const id = 5;
            const editorAdapter = new TestEditorAdapter<number>();
            const name = 'some_name';
            const selection = Selection.createCursor(2);

            const handler = { clear: jest.fn() };
            editorAdapter.setOtherSelection = jest.fn().mockReturnValue(handler);

            const client = new RemoteClient<number>(id, editorAdapter, name, selection);
            client.removeSelection();

            expect(handler.clear).toBeCalled();
            expect(client.lastSelection).toBe(null);
            expect(client.selectionEditorHandler).toBe(null);
        });
    });

    describe('remove', () => {
        it('should call removeSelection', () => {
            const id = 5;
            const editorAdapter = new TestEditorAdapter<number>();
            const name = 'some_name';
            const selection = Selection.createCursor(2);
            editorAdapter.setOtherSelection = jest.fn().mockReturnValue('markHandler');

            const client = new RemoteClient<number>(id, editorAdapter, name, selection);
            client.removeSelection = jest.fn();

            client.remove();

            expect(client.removeSelection).toBeCalled();
        });
    });
});
