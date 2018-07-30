import { TextOperation } from './TextOperation';

export abstract class SimpleOperation {
    abstract apply(document: string): string;

    abstract toString(): string;
    abstract toJson(): string | number;
    abstract equals(other: SimpleOperation): boolean;

    /**
     * Transform takes two operations A and B that happened concurrently
     * and produces two operations A' and B' (in an array)
     * such that `apply(apply(S, A), B') = apply(apply(S, B), A')`.
     * This function is the heart of OT.
     *
     * @static
     * @param {SimpleOperation} a
     * @param {SimpleOperation} b
     * @returns {[SimpleOperation, SimpleOperation]} [a', b']
     * @memberof SimpleOperation
     */
    public static transform(
        a: SimpleOperation,
        b: SimpleOperation
    ): [SimpleOperation, SimpleOperation] {
        if (a instanceof Noop || b instanceof Noop) {
            return [a, b];
        }

        if (a instanceof Insert && b instanceof Insert) {
            return SimpleOperation.transformInserts(a as Insert, b as Insert);
        }

        if (a instanceof Insert && b instanceof Delete) {
            return SimpleOperation.transformInsertaAndDelete(a as Insert, b as Delete);
        }

        if (a instanceof Delete && b instanceof Insert) {
            return SimpleOperation.transformDeleteAndInsert(a as Delete, b as Insert);
        }

        if (a instanceof Delete && b instanceof Delete) {
            return SimpleOperation.transformDeletes(a, b);
        }

        throw new Error('unknown operations: ' + a.toString() + ', ' + b.toString());
    }

    /**
     * Transforms two Insert operation agains each other based on their positions in document.
     * If positions are equal we prefer first operation in alphabetical order.
     *
     * @private
     * @static
     * @param {Insert} a
     * @param {Insert} b
     * @returns {[SimpleOperation, SimpleOperation]}
     * @memberof SimpleOperation
     */
    private static transformInserts(a: Insert, b: Insert): [SimpleOperation, SimpleOperation] {
        if (a.position < b.position || (a.position === b.position && a.str < b.str)) {
            return [a, new Insert(b.str, b.position + a.str.length)];
        } else if (a.position > b.position || (a.position === b.position && a.str > b.str)) {
            return [new Insert(a.str, a.position + b.str.length), b];
        } else {
            return [new Noop(), new Noop()];
        }
    }

    private static transformInsertaAndDelete(
        a: Insert,
        b: Delete
    ): [SimpleOperation, SimpleOperation] {
        if (a.position <= b.position) {
            return [a, new Delete(b.count, b.position + a.str.length)];
        } else if (a.position >= b.position + b.count) {
            return [new Insert(a.str, a.position - b.count), b];
        }
        // Here, we have to delete the inserted string of operation a.
        // That doesn't preserve the intention of operation a, but it's the only
        // thing we can do to get a valid transform function.
        return [new Noop(), new Delete(b.count + a.str.length, b.position)];
    }

    private static transformDeleteAndInsert(
        a: Delete,
        b: Insert
    ): [SimpleOperation, SimpleOperation] {
        const [resB, resA] = SimpleOperation.transformInsertaAndDelete(b, a);
        return [resA, resB];
    }

    private static transformDeletes(a: Delete, b: Delete): [SimpleOperation, SimpleOperation] {
        if (a.position === b.position) {
            if (a.count === b.count) {
                return [new Noop(), new Noop()];
            } else if (a.count < b.count) {
                return [new Noop(), new Delete(b.count - a.count, b.position)];
            }
            return [new Delete(a.count - b.count, a.position), new Noop()];
        } else if (a.position < b.position) {
            if (a.position + a.count <= b.position) {
                return [a, new Delete(b.count, b.position - a.count)];
            } else if (a.position + a.count >= b.position + b.count) {
                return [new Delete(a.count - b.count, a.position), new Noop()];
            }
            return [
                new Delete(b.position - a.position, a.position),
                new Delete(b.position + b.count - (a.position + a.count), a.position)
            ];
        } else {
            // if (a.position > b.position)
            if (a.position >= b.position + b.count) {
                return [new Delete(a.count, a.position - b.count), b];
            } else if (a.position + a.count <= b.position + b.count) {
                return [new Noop(), new Delete(b.count - a.count, b.position)];
            }
            return [
                new Delete(a.position + a.count - (b.position + b.count), b.position),
                new Delete(a.position - b.position, b.position)
            ];
        }
    }

    /**
     * Convert a normal, composable `TextOperation`, into an array of `SimpleTextOperation`s.
     *
     * @static
     * @param {TextOperation} operation
     * @returns {SimpleOperation[]}
     * @memberof SimpleOperation
     */
    public static fromTextOperation(operation: TextOperation): SimpleOperation[] {
        const simpleOperations = [];
        let index = 0;
        for (let i = 0; i < operation.ops.length; i++) {
            const op = operation.ops[i];
            if (op.isRetain()) {
                index += op.getNumberValue();
            } else if (op.isInsert()) {
                simpleOperations.push(new Insert(op.getStringValue(), index));
                index += op.getStringValue().length;
            } else {
                // if (op.isDelete())
                simpleOperations.push(new Delete(Math.abs(op.getNumberValue()), index));
            }
        }
        return simpleOperations;
    }
}

export class Noop extends SimpleOperation {
    apply(document: string): string {
        return document;
    }

    toString(): string {
        return 'Noop()';
    }

    toJson(): number {
        return 0;
    }

    equals(other: SimpleOperation): boolean {
        return other instanceof Noop;
    }
}

export class Delete extends SimpleOperation {
    count: number;
    position: number;

    constructor(count: number, position: number) {
        super();

        if (count <= 0) throw new Error('count must be greather then 0');
        if (position < 0) throw new Error('position must be greather then or equal 0');

        this.count = count;
        this.position = position;
    }

    apply(document: string): string {
        return document.slice(0, this.position) + document.slice(this.position + this.count);
    }

    toString(): string {
        return 'Delete(' + this.count + ', ' + this.position + ')';
    }

    toJson(): number {
        return -this.count;
    }

    equals(other: SimpleOperation): boolean {
        return (
            other instanceof Delete &&
            other.count === this.count &&
            other.position === this.position
        );
    }
}

export class Insert extends SimpleOperation {
    str: string;
    position: number;

    constructor(str: string, position: number) {
        super();

        if (str.length <= 0) throw new Error('str length must be greather then 0');
        if (position < 0) throw new Error('position must be greather then or equal 0');

        this.str = str;
        this.position = position;
    }

    apply(document: string): string {
        return document.slice(0, this.position) + this.str + document.slice(this.position);
    }

    toString(): string {
        return 'Insert(' + this.str + ', ' + this.position + ')';
    }

    toJson(): string {
        return this.str;
    }

    equals(other: SimpleOperation): boolean {
        return (
            other instanceof Insert && other.str === this.str && other.position === this.position
        );
    }
}
