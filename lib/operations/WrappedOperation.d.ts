import { TextOperation } from './TextOperation';
import { Selection } from './Selection';
export declare class WrappedOperation {
    operation: TextOperation;
    selection: Selection;
    /**
     * Creates instance of WrappedOperation around TextOperation and Selection.
     * @param {TextOperation} operation
     * @param {Selection} selection
     * @memberof WrappedOperation
     */
    constructor(operation: TextOperation, selection: Selection);
    /**
     * Calls apply function of wrapped TextOperation
     */
    apply(str: string): string;
    /**
     * Returns inverted WrappedOperation of inverted wrapped TextOperation and same Selection.
     *
     * @returns {WrappedOperation} inverted WrappedOperation
     */
    invert(str: string): WrappedOperation;
    /**
     * Returns new composed WrappedOperation.
     *
     * @param {WrappedOperation} other
     * @returns {WrappedOperation}
     */
    compose(other: WrappedOperation): WrappedOperation;
    /**
     * @see {TextOperation.transform}
     * @param {WrappedOperation} a
     * @param {WrappedOperation} b
     * @returns {[WrappedOperation, WrappedOperation]}
     */
    static transform(a: WrappedOperation, b: WrappedOperation): [WrappedOperation, WrappedOperation];
}
