declare abstract class Operation {
    abstract getStringValue(): string;
    abstract getNumberValue(): number;
    abstract add(add: number | string): void;
    abstract equals(other: Operation): boolean;
    isRetain(): boolean;
    isDelete(): boolean;
    isInsert(): boolean;
    toJSON(): number | string;
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
    /**
     * Computes the inverse of an operation. The inverse of an operation is the
     * operation that reverts the effects of the operation, e.g. when you have an
     * operation 'insert("hello "); skip(6);' then the inverse is 'delete("hello ");
     * skip(6);'. The inverse should be used for implementing undo.
     *
     * @param {string} str
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    invert(str: string): TextOperation;
    /**
     * Compose merges two consecutive operations into one operation, that
     * preserves the changes of both. Or, in other words, for each input string S
     * and a pair of consecutive operations A and B,
     * apply(apply(S, A), B) = apply(S, compose(A, B)) must hold.
     *
     * @param {TextOperation} other
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    compose(other: TextOperation): TextOperation;
    private static getSimpleOp;
    private static getStartIndex;
    /**
     * When you use ctrl-z to undo your latest changes, you expect the program not
     * to undo every single keystroke but to undo your last sentence you wrote at
     * a stretch or the deletion you did by holding the backspace key down. This
     * This can be implemented by composing operations on the undo stack. This
     * method can help decide whether two operations should be composed. It
     * returns true if the operations are consecutive insert operations or both
     * operations delete text at the same position. You may want to include other
     * factors like the time since the last change in your decision (feel free to
     * override this method in your children class).
     *
     * @param {TextOperation} other
     * @returns {boolean}
     * @memberof TextOperation
     */
    shouldBeComposedWith(other: TextOperation): boolean;
    /**
     * Decides whether two operations should be composed with each other
     * if they were inverted, that is
     * `shouldBeComposedWith(a, b) = shouldBeComposedWithInverted(b^{-1}, a^{-1})`.
     *
     * @param {TextOperation} other
     * @returns {boolean}
     * @memberof TextOperation
     */
    shouldBeComposedWithInverted(other: TextOperation): boolean;
    /**
     * Transform takes two operations A and B that happened concurrently and
     * produces two operations A' and B' (in an array) such that
     * `apply(apply(S, A), B') = apply(apply(S, B), A')`. This function is the
     * heart of OT.
     *
     * @static
     * @param {TextOperation} operation1
     * @param {TextOperation} operation2
     * @returns {[TextOperation, TextOperation]}
     * @memberof TextOperation
     */
    static transform(operation1: TextOperation, operation2: TextOperation): [TextOperation, TextOperation];
}
export {};
