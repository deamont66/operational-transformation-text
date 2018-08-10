import { AbstractEditorAdapter } from './AbstractEditorAdapter';
import { Selection } from '../operations/Selection';

export class RemoteClient<TId> {
    readonly id: TId;
    name: string;
    editorAdapter: AbstractEditorAdapter<TId> | null = null;
    lastSelection: Selection | null = null;
    selectionEditorHandler: any = null;

    constructor(id: TId, name: string = '', selection: Selection | null = null) {
        this.id = id;
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

    setEditorAdapter(editorAdapter: AbstractEditorAdapter<TId>) {
        this.editorAdapter = editorAdapter;

        if (this.lastSelection) {
            this.updateSelection(this.lastSelection);
        }
    }

    updateSelection(selection: Selection) {
        this.removeSelection();
        if (this.editorAdapter) {
            this.selectionEditorHandler = this.editorAdapter.setOtherSelection(this, selection);
        } else {
            this.selectionEditorHandler = null;
        }
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
