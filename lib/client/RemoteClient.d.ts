import { AbstractEditorAdapter } from './AbstractEditorAdapter';
import { Selection } from '../operations/Selection';
export declare class RemoteClient<TId> {
    readonly id: TId;
    name: string;
    editorAdapter: AbstractEditorAdapter<TId> | null;
    lastSelection: Selection | null;
    selectionEditorHandler: any;
    constructor(id: TId, name?: string, selection?: Selection | null);
    setName(name: string): void;
    setEditorAdapter(editorAdapter: AbstractEditorAdapter<TId>): void;
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
