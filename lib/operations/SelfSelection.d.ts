import { TextOperation } from './TextOperation';
import { Selection } from './Selection';
export declare class SelfSelection {
    selectionBefore: Selection;
    selectionAfter: Selection;
    constructor(selectionBefore: Selection, selectionAfter: Selection);
    invert(): SelfSelection;
    compose(other: SelfSelection): SelfSelection;
    transform(operation: TextOperation): SelfSelection;
}
