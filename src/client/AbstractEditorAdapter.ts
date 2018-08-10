import { Selection } from '../operations/Selection';
import { TextOperation } from '../operations/TextOperation';
import { Signal } from '../utils/Signal';
import { SimpleTypedEvent } from '../utils/SimpleTypedEvent';
import { RemoteClient } from './RemoteClient';

export interface Change {
    operation: TextOperation;
    inverseOperation: TextOperation;
}

/**
 * AbstractEditorAdapter for EditorClient
 *
 * @export
 * @abstract
 * @class AbstractEditorAdapter
 * @template TId remote client identificator type
 */
export abstract class AbstractEditorAdapter<TId> {
    /**
     * performed undo
     *
     * @memberof AbstractEditorAdapter
     */
    undo = new Signal();

    /**
     * performed redo
     *
     * @memberof AbstractEditorAdapter
     */
    redo = new Signal();

    /**
     * editor blur occurred
     *
     * @memberof AbstractEditorAdapter
     */
    blur = new Signal();

    /**
     * on editor selection change
     *
     * @memberof AbstractEditorAdapter
     */
    selectionChange = new Signal();

    /**
     * <{operation, selection}> - on editor value (and most likely selection) change
     *
     * @memberof AbstractEditorAdapter
     */
    change = new SimpleTypedEvent<Change>();

    /**
     * Sets other client selection to editor.
     *
     * @abstract
     * @param {RemoteClient<TId>} client
     * @param {Selection} selection
     * @returns {*}
     * @memberof AbstractEditorAdapter
     */
    abstract setOtherSelection(client: RemoteClient<TId>, selection: Selection): any;

    /**
     * Removes other client  selection from editor.
     *
     * @abstract
     * @param {RemoteClient<TId>} client
     * @memberof AbstractEditorAdapter
     */
    abstract removeOtherSelection(client: RemoteClient<TId>): void;

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
