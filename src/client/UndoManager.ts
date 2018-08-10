import { WrappedOperation } from '../operations/WrappedOperation';

export enum UndoManagerState {
    NORMAL_STATE,
    UNDOING_STATE,
    REDOING_STATE
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
export class UndoManager {
    maxItems: number;
    state: UndoManagerState;
    dontCompose: boolean;
    undoStack: WrappedOperation[];
    redoStack: WrappedOperation[];

    constructor(maxItems: number = 50) {
        this.maxItems = maxItems;
        this.state = UndoManagerState.NORMAL_STATE;
        this.dontCompose = false;
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * Adds operation to stack depending on state.
     *
     * @param {WrappedOperation} operation
     * @param {boolean} [compose=false]
     * @memberof UndoManager
     */
    add(operation: WrappedOperation, compose: boolean = false): void {
        switch (this.state) {
            case UndoManagerState.UNDOING_STATE: {
                this.redoStack.push(operation);
                this.dontCompose = true;
                break;
            }
            case UndoManagerState.REDOING_STATE: {
                this.undoStack.push(operation);
                this.dontCompose = true;
                break;
            }
            // NORMAL_STATE
            default: {
                if (!this.dontCompose && compose && this.undoStack.length > 0) {
                    this.undoStack.push(
                        operation.compose(this.undoStack.pop() as WrappedOperation)
                    );
                } else {
                    this.undoStack.push(operation);
                    if (this.undoStack.length > this.maxItems) {
                        this.undoStack.shift();
                    }
                }
                this.dontCompose = false;
                this.redoStack = [];
            }
        }
    }

    /**
     * Transforms both stack based on passed operation.
     *
     * @param {WrappedOperation} operation
     * @memberof UndoManager
     */
    transform(operation: WrappedOperation): void {
        this.undoStack = UndoManager.transformStack(this.undoStack, operation);
        this.redoStack = UndoManager.transformStack(this.redoStack, operation);
    }

    /**
     * Performs single undo. Calls callback with undo operation.
     *
     * @param {Callback} callback
     * @memberof UndoManager
     */
    performUndo(callback: Callback): void {
        this.state = UndoManagerState.UNDOING_STATE;
        if (this.undoStack.length === 0) {
            throw new Error('undo not possible');
        }
        callback(this.undoStack.pop() as WrappedOperation);
        this.state = UndoManagerState.NORMAL_STATE;
    }

    /**
     * Performs single redo (inverse to performUndo). Calls callback with redo operation.
     *
     * @param {Callback} callback
     * @memberof UndoManager
     */
    performRedo(callback: Callback): void {
        this.state = UndoManagerState.REDOING_STATE;
        if (this.redoStack.length === 0) {
            throw new Error('redo not possible');
        }
        callback(this.redoStack.pop() as WrappedOperation);
        this.state = UndoManagerState.NORMAL_STATE;
    }

    /**
     * Decides whenever is undo available (based on undoStack size).
     *
     * @returns {boolean} is undo available
     * @memberof UndoManager
     */
    canUndo(): boolean {
        return this.undoStack.length !== 0;
    }

    /**
     * Decides whenever is redo available (based on redoStack size).
     *
     * @returns {boolean} is redo available
     * @memberof UndoManager
     */
    canRedo(): boolean {
        return this.redoStack.length !== 0;
    }

    /**
     * Checks state of this UndoManager instance.
     *
     * @returns {boolean} is undoing operation in process
     * @memberof UndoManager
     */
    isUndoing(): boolean {
        return this.state === UndoManagerState.UNDOING_STATE;
    }

    /**
     * Checks state of this UndoManager instance.
     *
     * @returns {boolean} is redoing operation in process
     * @memberof UndoManager
     */
    isRedoing(): boolean {
        return this.state === UndoManagerState.REDOING_STATE;
    }

    /**
     * Transforms given stack according to new operation.
     *
     * @param {WrappedOperation[]} stack
     * @param {WrappedOperation} operation
     * @returns {WrappedOperation[]}
     */
    static transformStack(
        stack: WrappedOperation[],
        operation: WrappedOperation
    ): WrappedOperation[] {
        const newStack = [];
        for (let i = stack.length - 1; i >= 0; i--) {
            const pair = WrappedOperation.transform(stack[i], operation);
            newStack.push(pair[0]);
            operation = pair[1];
        }
        return newStack.reverse();
    }
}
