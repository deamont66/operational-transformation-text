import { TextOperation } from './TextOperation';
import { Selection } from './Selection';

export class SelfSelection {
    selectionBefore: Selection;
    selectionAfter: Selection;

    constructor(selectionBefore: Selection, selectionAfter: Selection) {
        this.selectionBefore = selectionBefore;
        this.selectionAfter = selectionAfter;
    }

    invert() {
        return new SelfSelection(this.selectionAfter, this.selectionBefore);
    }

    compose(other: SelfSelection) {
        return new SelfSelection(this.selectionBefore, other.selectionAfter);
    }

    transform(operation: TextOperation) {
        return new SelfSelection(
            this.selectionBefore.transform(operation),
            this.selectionAfter.transform(operation)
        );
    }
}
