import { AbstractEditorAdapter } from '../../src/client/AbstractEditorAdapter';
import { TextOperation } from '../../src/operations/TextOperation';
import { Selection } from '../../src/operations/Selection';

class TestEditorAdapter extends AbstractEditorAdapter {
    /**
     * Sets other client selection to editor.
     */
    setOtherSelection(): any {
        throw new Error('Method not implemented.');
    }

    /**
     * @return {String} editor value
     */
    getValue(): string {
        throw new Error('Method not implemented.');
    }

    /**
     * @return {Selection} editor active selection
     */
    getSelection(): Selection {
        throw new Error('Method not implemented.');
    }

    /**
     * Applies text operation to editor.
     * @param {TextOperation} operation
     */
    applyOperation(operation: TextOperation): void {
        throw new Error('Method not implemented.');
    }

    /**
     * Sets editor selection
     * @param {Selection} selection
     */
    setSelection(selection: Selection): void {
        throw new Error('Method not implemented.');
    }
}

describe('AbstractEditorAdapter', () => {
    it('should have all events', () => {
        const adapter = new TestEditorAdapter();
        expect(adapter.undo).toBeDefined();
        expect(adapter.redo).toBeDefined();
        expect(adapter.blur).toBeDefined();
        expect(adapter.selectionChange).toBeDefined();
        expect(adapter.change).toBeDefined();
    });
});
