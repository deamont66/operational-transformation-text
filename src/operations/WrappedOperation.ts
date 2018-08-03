import { TextOperation } from './TextOperation';
import { Selection } from './Selection';

export class WrappedOperation {
    operation: TextOperation;
    selection: Selection;

    /**
     * Creates instance of WrappedOperation around TextOperation and Selection.
     * @param {TextOperation} operation
     * @param {Selection} selection
     * @memberof WrappedOperation
     */
    constructor(operation: TextOperation, selection: Selection) {
        this.operation = operation;
        this.selection = selection;
    }

    /**
     * Calls apply function of wrapped TextOperation
     */
    apply(str: string): string {
        return this.operation.apply(str);
    }

    /**
     * Returns inverted WrappedOperation of inverted wrapped TextOperation and same Selection.
     *
     * @returns {WrappedOperation} inverted WrappedOperation
     */
    invert(str: string): WrappedOperation {
        return new WrappedOperation(this.operation.invert(str), this.selection);
    }

    /**
     * Returns new composed WrappedOperation.
     *
     * @param {WrappedOperation} other
     * @returns {WrappedOperation}
     */
    compose(other: WrappedOperation): WrappedOperation {
        return new WrappedOperation(
            this.operation.compose(other.operation),
            this.selection.compose(other.selection)
        );
    }

    /**
     * @see {TextOperation.transform}
     * @param {WrappedOperation} a
     * @param {WrappedOperation} b
     * @returns {[WrappedOperation, WrappedOperation]}
     */
    static transform(
        a: WrappedOperation,
        b: WrappedOperation
    ): [WrappedOperation, WrappedOperation] {
        const pair = TextOperation.transform(a.operation, b.operation);
        return [
            new WrappedOperation(pair[0], a.selection.transform(b.operation)),
            new WrappedOperation(pair[1], b.selection.transform(a.operation))
        ];
    }
}
