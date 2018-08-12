import { WrappedOperation } from '../operations/WrappedOperation';
export declare enum UndoManagerState {
    NORMAL_STATE = 0,
    UNDOING_STATE = 1,
    REDOING_STATE = 2
}
interface Callback {
    (operation: WrappedOperation): void;
}
/**
 * Undo manager for WrappedOperation
 *
 * @export
 * @class UndoManager
 */
export declare class UndoManager {
    maxItems: number;
    state: UndoManagerState;
    dontCompose: boolean;
    undoStack: WrappedOperation[];
    redoStack: WrappedOperation[];
    constructor(maxItems?: number);
    /**
     * Adds operation to stack depending on state.
     *
     * @param {WrappedOperation} operation
     * @param {boolean} [compose=false]
     * @memberof UndoManager
     */
    add(operation: WrappedOperation, compose?: boolean): void;
    /**
     * Transforms both stack based on passed operation.
     *
     * @param {WrappedOperation} operation
     * @memberof UndoManager
     */
    transform(operation: WrappedOperation): void;
    /**
     * Performs single undo. Calls callback with undo operation.
     *
     * @param {Callback} callback
     * @memberof UndoManager
     */
    performUndo(callback: Callback): void;
    /**
     * Performs single redo (inverse to performUndo). Calls callback with redo operation.
     *
     * @param {Callback} callback
     * @memberof UndoManager
     */
    performRedo(callback: Callback): void;
    /**
     * Decides whenever is undo available (based on undoStack size).
     *
     * @returns {boolean} is undo available
     * @memberof UndoManager
     */
    canUndo(): boolean;
    /**
     * Decides whenever is redo available (based on redoStack size).
     *
     * @returns {boolean} is redo available
     * @memberof UndoManager
     */
    canRedo(): boolean;
    /**
     * Checks state of this UndoManager instance.
     *
     * @returns {boolean} is undoing operation in process
     * @memberof UndoManager
     */
    isUndoing(): boolean;
    /**
     * Checks state of this UndoManager instance.
     *
     * @returns {boolean} is redoing operation in process
     * @memberof UndoManager
     */
    isRedoing(): boolean;
    /**
     * Transforms given stack according to new operation.
     *
     * @param {WrappedOperation[]} stack
     * @param {WrappedOperation} operation
     * @returns {WrappedOperation[]}
     */
    static transformStack(stack: WrappedOperation[], operation: WrappedOperation): WrappedOperation[];
}
export {};
