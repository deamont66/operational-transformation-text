abstract class Operation {
    abstract getStringValue(): string;
    abstract getNumberValue(): number;
    abstract add(add: number | string): void;
    abstract equals(other: Operation): boolean;

    isRetain(): boolean {
        return this.constructor.name === 'Retain';
    }

    isDelete(): boolean {
        return this.constructor.name === 'Delete';
    }

    isInsert(): boolean {
        return this.constructor.name === 'Insert';
    }
}

export class Retain extends Operation {
    length: number;

    constructor(length: number) {
        super();

        if (length <= 0) {
            throw new Error('length must be positive');
        }

        this.length = length;
    }

    getNumberValue(): number {
        return this.length;
    }

    getStringValue(): string {
        throw new Error('Retain does not have string value');
    }

    add(add: number): void {
        if (add < 0) add = -add;
        this.length += add;
    }

    equals(other: Operation): boolean {
        return other instanceof Retain && this.getNumberValue() === other.getNumberValue();
    }
}

export class Delete extends Operation {
    length: number;

    constructor(length: number) {
        super();

        if (length >= 0) {
            throw new Error('length must be negative');
        }

        this.length = length;
    }

    getNumberValue(): number {
        return this.length;
    }

    getStringValue(): string {
        throw new Error('Delete does not have string value');
    }

    add(add: number): void {
        if (add > 0) add = -add;
        this.length += add;
    }

    equals(other: Operation): boolean {
        return other instanceof Delete && this.getNumberValue() === other.getNumberValue();
    }
}

export class Insert extends Operation {
    str: string;

    constructor(str: string) {
        super();
        this.str = str;
    }

    getNumberValue(): number {
        throw new Error('Retain does not have number value');
    }

    getStringValue(): string {
        return this.str;
    }

    add(add: string): void {
        this.str += add;
    }

    equals(other: Operation): boolean {
        return other instanceof Insert && this.getStringValue() === other.getStringValue();
    }
}

/**
 * Operation is essentially list of `Operation`s. There are three types of ops:
 * Retain ops: Advance the cursor position by a given number of characters.
 *  Represented by positive ints.
 * Insert ops: Insert a given string at the current cursor position.
 *  Represented by strings.
 * Delete ops: Delete the next n characters. Represented by negative ints.
 *
 * After an operation is constructed, the user of the library can specify the
 * actions of an operation (skip/insert/delete) with these three builder
 * methods. They all return the operation for convenient chaining.
 *
 * @export
 * @class TextOperation
 */
export class TextOperation {
    ops: Operation[];
    baseLength: number;
    targetLength: number;

    constructor() {
        this.ops = [];
        this.baseLength = 0;
        this.targetLength = 0;
    }

    equals(other: TextOperation): boolean {
        if (this.baseLength !== other.baseLength) {
            return false;
        }
        if (this.targetLength !== other.targetLength) {
            return false;
        }
        if (this.ops.length !== other.ops.length) {
            return false;
        }
        for (var i = 0; i < this.ops.length; i++) {
            if (!this.ops[i].equals(other.ops[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Skip over a given number of characters.
     *
     * @param {number} length
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    retain(length: number): TextOperation {
        if (length === 0) return this;

        this.baseLength += length;
        this.targetLength += length;
        if (this.ops.length > 0 && this.ops[this.ops.length - 1].isRetain()) {
            // The last op is a retain op => we can merge them into one op.
            this.ops[this.ops.length - 1].add(length);
        } else {
            // Create a new op.
            this.ops.push(new Retain(length));
        }
        return this;
    }

    /**
     * Insert a string at the current position.
     *
     * @param {string} str
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    insert(str: string): TextOperation {
        if (str === '') return this;

        this.targetLength += str.length;
        if (this.ops.length > 0 && this.ops[this.ops.length - 1].isInsert()) {
            // Merge insert op.
            this.ops[this.ops.length - 1].add(str);
        } else if (this.ops.length > 1 && this.ops[this.ops.length - 1].isDelete()) {
            // It doesn't matter when an operation is applied whether the operation
            // is delete(3), insert("something") or insert("something"), delete(3).
            // Here we enforce that in this case, the insert op always comes first.
            // This makes all operations that have the same effect when applied to
            // a document of the right length equal in respect to the `equals` method.
            if (this.ops.length > 1 && this.ops[this.ops.length - 2].isInsert()) {
                this.ops[this.ops.length - 2].add(str);
            } else {
                this.ops[this.ops.length] = this.ops[this.ops.length - 1];
                this.ops[this.ops.length - 2] = new Insert(str);
            }
        } else {
            this.ops.push(new Insert(str));
        }
        return this;
    }

    /**
     * Delete a string at the current position.
     *
     * @param {(number | string)} length
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    delete(length: number | string): TextOperation {
        if (typeof length === 'string') {
            length = length.length;
        }
        if (length === 0) return this;
        if (length > 0) {
            length = -length;
        }
        this.baseLength -= length;
        if (this.ops.length > 0 && this.ops[this.ops.length - 1].isDelete()) {
            this.ops[this.ops.length - 1].add(length);
        } else {
            this.ops.push(new Delete(length));
        }
        return this;
    }

    /**
     * Tests whether this operation has no effect.
     *
     * @returns {boolean}
     * @memberof TextOperation
     */
    isNoop(): boolean {
        return this.ops.length === 0 || (this.ops.length === 1 && this.ops[0].isRetain());
    }

    /**
     * Pretty printing.
     *
     * @returns {string}
     * @memberof TextOperation
     */
    toString(): string {
        return this.ops
            .map(op => {
                if (op.isRetain()) {
                    return 'retain ' + op.getNumberValue();
                } else if (op.isInsert()) {
                    return "insert '" + op.getStringValue() + "'";
                } else {
                    return 'delete ' + -op.getNumberValue();
                }
            })
            .join(', ');
    }

    /**
     * Converts operation into a JSON value.
     *
     * @returns {((string | number)[])}
     * @memberof TextOperation
     */
    toJSON(): (string | number)[] {
        return this.ops.map(op => {
            if (op.isRetain() || op.isDelete()) {
                return op.getNumberValue();
            } else {
                // if (op.isInsert())
                return op.getStringValue();
            }
        });
    }

    /**
     * Converts a plain JS object into an operation and validates it.
     *
     * @static
     * @param {(string | number)[]} operations
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    static fromJSON(operations: (string | number)[]): TextOperation {
        const o = new TextOperation();
        operations.forEach(op => {
            if (typeof op === 'number') {
                if (op < 0) {
                    o.delete(op);
                } else {
                    o.retain(op);
                }
            } else if (typeof op === 'string') {
                o.insert(op);
            } else {
                throw new Error('Incorrect format of operation');
            }
        });
        return o;
    }

    /**
     * Apply an operation to a string, returning a new string. Throws an error if
     * there's a mismatch between the input string and the operation.
     *
     * @param {string} str
     * @returns {string}
     * @memberof TextOperation
     */
    apply(str: string): string {
        if (str.length !== this.baseLength) {
            throw new Error("The operation's base length must be equal to the string's length.");
        }
        const newStr: string[] = [];
        let j: number = 0;
        let strIndex = 0;
        for (let i = 0, l = this.ops.length; i < l; i++) {
            const op = this.ops[i];
            if (op.isRetain()) {
                if (strIndex + op.getNumberValue() > str.length) {
                    throw new Error(
                        "Operation can't retain more characters than are left in the string."
                    );
                }
                newStr[j++] = str.slice(strIndex, strIndex + op.getNumberValue());
                strIndex += op.getNumberValue();
            } else if (op.isInsert()) {
                newStr[j++] = op.getStringValue();
            } else {
                strIndex -= op.getNumberValue();
            }
        }
        if (strIndex !== str.length) {
            throw new Error("The operation didn't operate on the whole string.");
        }
        return newStr.join('');
    }
}
