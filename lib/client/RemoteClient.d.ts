import { AbstractEditorAdapter } from './AbstractEditorAdapter';
import { Selection } from '../operations/Selection';
export declare class RemoteClient<TId> {
    readonly id: TId;
    readonly editorAdapter: AbstractEditorAdapter<TId>;
    name: string;
    lastSelection: Selection | null;
    selectionEditorHandler: any;
    constructor(id: TId, editorAdapter: AbstractEditorAdapter<TId>, name?: string, selection?: Selection | null);
    setName(name: string): void;
    updateSelection(selection: Selection): void;
    /**
     * Removes client selection.
     *
     * Optionally reimplement this method to remove selection after client disconnected (ie. remove client selection marker from editor).
     */
    removeSelection(): void;
    /**
     * Clean up after client (internally calls @method removeSelection).
     *
     * Optionally reimplement this method to clean up after client disconnected.
     */
    remove(): void;
}
