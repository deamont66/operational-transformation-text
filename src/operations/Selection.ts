import { TextOperation } from './TextOperation';

export class Range {
    anchor: number;
    head: number;

    constructor(anchor: number, head: number) {
        this.anchor = anchor;
        this.head = head;
    }

    static fromJSON(obj: { anchor: number; head: number }): Range {
        return new Range(obj.anchor, obj.head);
    }

    equals(other: Range): boolean {
        return this.anchor === other.anchor && this.head === other.head;
    }

    isEmpty(): boolean {
        return this.anchor === this.head;
    }

    transform(operation: TextOperation): Range {
        const newAnchor = Range.transformIndex(operation, this.anchor);
        if (this.anchor === this.head) {
            return new Range(newAnchor, newAnchor);
        }
        return new Range(newAnchor, Range.transformIndex(operation, this.head));
    }

    private static transformIndex(other: TextOperation, index: number): number {
        let newIndex = index;
        const ops = other.ops;
        for (let i = 0, l = other.ops.length; i < l; i++) {
            if (ops[i].isRetain()) {
                index -= ops[i].getNumberValue();
            } else if (ops[i].isInsert()) {
                newIndex += ops[i].getStringValue().length;
            } else {
                //  if (ops[i].isDelete()
                newIndex -= Math.min(index, -ops[i].getNumberValue());
                index += ops[i].getNumberValue();
            }
            if (index < 0) {
                break;
            }
        }
        return newIndex;
    }
}

export class Selection {
    ranges: Range[];

    constructor(ranges: Range[] = []) {
        this.ranges = ranges;
    }

    static createCursor(position: number): Selection {
        return new Selection([new Range(position, position)]);
    }

    static fromJSON(obj: { ranges: { anchor: number; head: number }[] }): Selection {
        const objRanges = obj.ranges;
        const ranges: Range[] = [];
        for (let i = 0; i < objRanges.length; i++) {
            ranges[i] = Range.fromJSON(objRanges[i]);
        }
        return new Selection(ranges);
    }

    equals(other: Selection): boolean {
        if (this.ranges.length !== other.ranges.length) {
            return false;
        }
        const sortedA = this.ranges.slice(0).sort((a, b) => a.anchor - b.anchor || a.head - b.head);
        const sortedB = other.ranges
            .slice(0)
            .sort((a, b) => a.anchor - b.anchor || a.head - b.head);

        for (let i = 0; i < sortedA.length; i++) {
            if (!sortedA[i].equals(sortedB[i])) {
                return false;
            }
        }
        return true;
    }

    somethingSelected(): boolean {
        for (let i = 0; i < this.ranges.length; i++) {
            if (!this.ranges[i].isEmpty()) {
                return true;
            }
        }
        return false;
    }

    // Return the more current selection information.
    compose(other: Selection): Selection {
        return other;
    }

    // Update the selection with respect to an operation.
    transform(other: TextOperation): Selection {
        const newRanges: Range[] = [];
        for (let i = 0; i < this.ranges.length; i++) {
            newRanges[i] = this.ranges[i].transform(other);
        }
        return new Selection(newRanges);
    }
}
