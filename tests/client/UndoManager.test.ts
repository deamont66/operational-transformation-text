import { UndoManager, UndoManagerState } from '../../src/client/UndoManager';
import { WrappedOperation } from '../../src/operations/WrappedOperation';
import { TextOperation } from '../../src/operations/TextOperation';

describe('UndoManager', () => {
    describe('constructor', () => {
        it('should initialize stacks and manager state', () => {
            const undoManager = new UndoManager(13);
            expect(undoManager.maxItems).toBe(13);
            expect(undoManager.state).toBe(UndoManagerState.NORMAL_STATE);
            expect(undoManager.dontCompose).toBe(false);
            expect(undoManager.undoStack.length).toBe(0);
            expect(undoManager.redoStack.length).toBe(0);
        });

        it('should initialize maxItems with default value 50', () => {
            const undoManager = new UndoManager();
            expect(undoManager.maxItems).toBe(50);
        });
    });

    describe('transformStack', () => {
        it('shoull return new transformed stack', () => {
            const stack: WrappedOperation[] = [];
            const newStack = UndoManager.transformStack(
                stack,
                new WrappedOperation(new TextOperation(), null)
            );
            expect(newStack).not.toBe(stack);
        });

        it('should transform all operations in given stack in reverse order', () => {
            const stack: WrappedOperation[] = [
                new WrappedOperation(new TextOperation(), null),
                new WrappedOperation(new TextOperation(), null)
            ];
            const transformOperation = new WrappedOperation(new TextOperation(), null);
            const retOperationPairs = [
                [
                    new WrappedOperation(new TextOperation(), null),
                    new WrappedOperation(new TextOperation(), null)
                ],
                [
                    new WrappedOperation(new TextOperation(), null),
                    new WrappedOperation(new TextOperation(), null)
                ]
            ];
            WrappedOperation.transform = jest
                .fn()
                .mockReturnValueOnce(retOperationPairs[0])
                .mockReturnValueOnce(retOperationPairs[1]);

            const newStack = UndoManager.transformStack(stack, transformOperation);

            expect(newStack).not.toBe(stack);
            expect(WrappedOperation.transform).toHaveBeenNthCalledWith(
                1,
                stack[1],
                transformOperation
            );
            expect(WrappedOperation.transform).toHaveBeenNthCalledWith(
                2,
                stack[0],
                retOperationPairs[0][1]
            );
            expect(newStack[0]).toBe(retOperationPairs[1][0]);
            expect(newStack[1]).toBe(retOperationPairs[0][0]);
        });
    });

    describe('transform', () => {
        it('should call transfromStack with both stacks and set returned value', () => {
            const realTransformStack = UndoManager.transformStack;
            const undoManager = new UndoManager();
            const prevUndoStack = undoManager.undoStack;
            const prevRedoStack = undoManager.redoStack;
            const retUndoStack: WrappedOperation[] = [];
            const retRedoStack: WrappedOperation[] = [];
            UndoManager.transformStack = jest
                .fn()
                .mockReturnValueOnce(retUndoStack)
                .mockReturnValueOnce(retRedoStack);
            const transformOperation = new WrappedOperation(new TextOperation(), null);

            undoManager.transform(transformOperation);

            expect(UndoManager.transformStack).toHaveBeenNthCalledWith(
                1,
                prevUndoStack,
                transformOperation
            );
            expect(UndoManager.transformStack).toHaveBeenNthCalledWith(
                2,
                prevRedoStack,
                transformOperation
            );

            expect(undoManager.undoStack).toBe(retUndoStack);
            expect(undoManager.redoStack).toBe(retRedoStack);

            UndoManager.transformStack = realTransformStack;
        });
    });

    describe('performUndo', () => {
        it('should change state durring callback call', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);
            undoManager.add(stackOperation);

            undoManager.performUndo(operation => {
                expect(undoManager.state).toBe(UndoManagerState.UNDOING_STATE);
                expect(operation).toBe(stackOperation);
            });

            expect(undoManager.state).toBe(UndoManagerState.NORMAL_STATE);
        });
        it('should throw an error when undo stack is empty', () => {
            const undoManager = new UndoManager();
            expect(() => undoManager.performUndo(() => {})).toThrowError();
        });
    });

    describe('performRedo', () => {
        it('should change state durring callback call', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);
            undoManager.add(stackOperation);
            undoManager.performUndo(operation => {
                undoManager.add(operation);
            });

            undoManager.performRedo(operation => {
                expect(undoManager.state).toBe(UndoManagerState.REDOING_STATE);
                expect(operation).toBe(stackOperation);
            });

            expect(undoManager.state).toBe(UndoManagerState.NORMAL_STATE);
        });
        it('should throw an error when undo stack is empty', () => {
            const undoManager = new UndoManager();
            expect(() => undoManager.performRedo(() => {})).toThrowError();
        });
    });

    describe('canUndo', () => {
        it('should return true if undo stack is not empty else false', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);
            expect(undoManager.canUndo()).toBe(false);
            undoManager.add(stackOperation);
            expect(undoManager.canUndo()).toBe(true);
        });
    });

    describe('canRedo', () => {
        it('should return true if redo stack is not empty else false', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);
            expect(undoManager.canRedo()).toBe(false);
            undoManager.add(stackOperation);
            undoManager.performUndo(operation => {
                undoManager.add(operation);
            });
            expect(undoManager.canRedo()).toBe(true);
        });
    });

    describe('isUndoing', () => {
        it('should return true if state is UNDOING_STATE else false', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);
            expect(undoManager.isUndoing()).toBe(false);
            undoManager.add(stackOperation);
            undoManager.performUndo(operation => {
                expect(undoManager.isUndoing()).toBe(true);
            });
        });
    });

    describe('isRedoing', () => {
        it('should return true if state is REDOING_STATE else false', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);
            expect(undoManager.isRedoing()).toBe(false);
            undoManager.add(stackOperation);
            undoManager.performUndo(o => {
                undoManager.add(o);
            });
            undoManager.performRedo(() => {
                expect(undoManager.isRedoing()).toBe(true);
            });
        });
    });

    describe('add', () => {
        it('should add operation to undostack when in NORMAL state', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);
            undoManager.add(stackOperation);
            expect(undoManager.undoStack[0]).toBe(stackOperation);
        });

        it('should try to compose operation to last undostack when in NORMAL state and compose true', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);
            const composeOperation = new WrappedOperation(new TextOperation(), null);
            const composedOperation = new WrappedOperation(new TextOperation(), null);
            composeOperation.compose = jest.fn().mockReturnValueOnce(composedOperation);

            undoManager.add(stackOperation);
            undoManager.add(composeOperation, true);

            expect(composeOperation.compose).toBeCalledWith(stackOperation);
            expect(undoManager.undoStack[0]).toBe(composedOperation);
        });

        it('should shift undo stack when full and in NORMAL state', () => {
            const undoManager = new UndoManager(1);
            const stackOperation = new WrappedOperation(new TextOperation(), null);
            const newStackOperation = new WrappedOperation(new TextOperation(), null);

            undoManager.add(stackOperation);
            undoManager.add(newStackOperation);

            expect(undoManager.undoStack[0]).toBe(newStackOperation);
        });

        it('should reset redo stack and dontCompose when in NORMAL state', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);
            const newStackOperation = new WrappedOperation(new TextOperation(), null);

            undoManager.add(stackOperation);
            undoManager.performUndo(o => {
                undoManager.add(o);
            });
            undoManager;
            expect(undoManager.redoStack.length).not.toBe(0);
            expect(undoManager.dontCompose).toBe(true);

            undoManager.add(newStackOperation);

            expect(undoManager.redoStack.length).toBe(0);
            expect(undoManager.dontCompose).toBe(false);
        });

        it('should add operation to redo stack and set dontCompose when in UNDOING state', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);

            undoManager.add(stackOperation);

            expect(undoManager.dontCompose).toBe(false);
            expect(undoManager.redoStack.length).toBe(0);

            undoManager.performUndo(o => {
                undoManager.add(o);
            });

            expect(undoManager.dontCompose).toBe(true);
            expect(undoManager.redoStack.length).not.toBe(0);
        });

        it('should add operation to undo stack and set dontCompose when in REDOING state', () => {
            const undoManager = new UndoManager();
            const stackOperation = new WrappedOperation(new TextOperation(), null);

            undoManager.add(stackOperation);

            undoManager.performUndo(o => {
                undoManager.add(o);
            });

            undoManager.dontCompose = false;
            expect(undoManager.undoStack.length).toBe(0);

            undoManager.performRedo(o => {
                undoManager.add(o);
            });

            expect(undoManager.dontCompose).toBe(true);
            expect(undoManager.undoStack.length).not.toBe(0);
        });
    });
});
