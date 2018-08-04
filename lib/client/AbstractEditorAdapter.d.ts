import { Selection } from '../operations/Selection';
import { TextOperation } from '../operations/TextOperation';
import { Signal } from '../utils/Signal';
import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';
interface Change {
    operation: TextOperation;
    selection: Selection;
}
/**
 * AbstractEditorAdapter for EditorClient
 *
 * @export
 * @abstract
 * @class AbstractEditorAdapter
 */
export declare abstract class AbstractEditorAdapter {
    /**
     * performed undo
     *
     * @memberof AbstractEditorAdapter
     */
    undo: Signal;
    /**
     * performed redo
     *
     * @memberof AbstractEditorAdapter
     */
    redo: Signal;
    /**
     * editor blur occurred
     *
     * @memberof AbstractEditorAdapter
     */
    blur: Signal;
    /**
     * on editor selection change
     *
     * @memberof AbstractEditorAdapter
     */
    selectionChange: Signal;
    /**
     * <{operation, selection}> - on editor value (and most likely selection) change
     *
     * @memberof AbstractEditorAdapter
     */
    change: SimpleTypedEvent<Change>;
    /**
     * Sets other client selection to editor.
     */
    abstract setOtherSelection(): any;
    /**
     * @return {String} editor value
     */
    abstract getValue(): string;
    /**
     * @return {Selection} editor active selection
     */
    abstract getSelection(): Selection;
    /**
     * Applies text operation to editor.
     * @param {TextOperation} operation
     */
    abstract applyOperation(operation: TextOperation): void;
    /**
     * Sets editor selection
     * @param {Selection} selection
     */
    abstract setSelection(selection: Selection): void;
}
export {};
