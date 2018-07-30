declare abstract class Operation {
    abstract getStringValue(): string;
    abstract getNumberValue(): number;
    abstract add(add: number | string): void;
    abstract equals(other: Operation): boolean;
    isRetain(): boolean;
    isDelete(): boolean;
    isInsert(): boolean;
}
export declare class Retain extends Operation {
    length: number;
    constructor(length: number);
    getNumberValue(): number;
    getStringValue(): string;
    add(add: number): void;
    equals(other: Operation): boolean;
}
export declare class Delete extends Operation {
    length: number;
    constructor(length: number);
    getNumberValue(): number;
    getStringValue(): string;
    add(add: number): void;
    equals(other: Operation): boolean;
}
export declare class Insert extends Operation {
    str: string;
    constructor(str: string);
    getNumberValue(): number;
    getStringValue(): string;
    add(add: string): void;
    equals(other: Operation): boolean;
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
export declare class TextOperation {
    ops: Operation[];
    baseLength: number;
    targetLength: number;
    constructor();
    equals(other: TextOperation): boolean;
    /**
     * Skip over a given number of characters.
     *
     * @param {number} length
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    retain(length: number): TextOperation;
    /**
     * Insert a string at the current position.
     *
     * @param {string} str
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    insert(str: string): TextOperation;
    /**
     * Delete a string at the current position.
     *
     * @param {(number | string)} length
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    delete(length: number | string): TextOperation;
    /**
     * Tests whether this operation has no effect.
     *
     * @returns {boolean}
     * @memberof TextOperation
     */
    isNoop(): boolean;
    /**
     * Pretty printing.
     *
     * @returns {string}
     * @memberof TextOperation
     */
    toString(): string;
    /**
     * Converts operation into a JSON value.
     *
     * @returns {((string | number)[])}
     * @memberof TextOperation
     */
    toJSON(): (string | number)[];
    /**
     * Converts a plain JS object into an operation and validates it.
     *
     * @static
     * @param {(string | number)[]} operations
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    static fromJSON(operations: (string | number)[]): TextOperation;
    /**
     * Apply an operation to a string, returning a new string. Throws an error if
     * there's a mismatch between the input string and the operation.
     *
     * @param {string} str
     * @returns {string}
     * @memberof TextOperation
     */
    apply(str: string): string;
}
export {};
