import { AbstractEditorAdapter } from '../../src/client/AbstractEditorAdapter';
import { TextOperation } from '../../src/operations/TextOperation';
import { Selection } from '../../src/operations/Selection';
import { RemoteClient } from '../../src/client/RemoteClient';

export class TestEditorAdapter<TId> extends AbstractEditorAdapter<TId> {
    setOtherSelection(client: RemoteClient<TId>, selection: Selection): any {
        throw new Error('Method not implemented.');
    }

    removeOtherSelection(client: RemoteClient<TId>): void {
        throw new Error('Method not implemented.');
    }

    getValue(): string {
        throw new Error('Method not implemented.');
    }

    getSelection(): Selection {
        throw new Error('Method not implemented.');
    }

    applyOperation(operation: TextOperation): void {
        throw new Error('Method not implemented.');
    }

    setSelection(selection: Selection): void {
        throw new Error('Method not implemented.');
    }
}

describe('AbstractEditorAdapter', () => {
    it('should have all events', () => {
        const adapter = new TestEditorAdapter<number>();
        expect(adapter.undo).toBeDefined();
        expect(adapter.redo).toBeDefined();
        expect(adapter.blur).toBeDefined();
        expect(adapter.selectionChange).toBeDefined();
        expect(adapter.change).toBeDefined();
    });
});
