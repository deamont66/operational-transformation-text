import { AbstractEditorAdapter } from './AbstractEditorAdapter';
import { Selection } from '../operations/Selection';

export class RemoteClient<TId> {
    readonly id: TId;
    readonly editorAdapter: AbstractEditorAdapter<TId>;
    name: string;
    lastSelection: Selection | null = null;
    selectionEditorHandler: any = null;

    constructor(
        id: TId,
        editorAdapter: AbstractEditorAdapter<TId>,
        name: string = '',
        selection: Selection | null = null
    ) {
        this.id = id;
        this.editorAdapter = editorAdapter;
        this.name = name;

        if (selection) {
            this.updateSelection(selection);
        }
    }

    setName(name: string) {
        if (this.name !== name) {
            this.name = name;
            if (this.lastSelection) {
                this.updateSelection(this.lastSelection);
            }
        }
    }

    updateSelection(selection: Selection) {
        this.removeSelection();
        this.selectionEditorHandler = this.editorAdapter.setOtherSelection(this, selection);
        this.lastSelection = selection;
    }

    /**
     * Removes client selection.
     *
     * Optionally reimplement this method to remove selection after client disconnected (ie. remove client selection marker from editor).
     */
    removeSelection() {
        if (this.selectionEditorHandler && this.selectionEditorHandler.clear) {
            this.selectionEditorHandler.clear();
        }
        this.lastSelection = null;
        this.selectionEditorHandler = null;
    }

    /**
     * Clean up after client (internally calls @method removeSelection).
     *
     * Optionally reimplement this method to clean up after client disconnected.
     */
    remove() {
        this.removeSelection();
    }
}
