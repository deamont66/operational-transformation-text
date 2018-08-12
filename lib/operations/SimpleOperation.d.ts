import { TextOperation } from './TextOperation';
export declare abstract class SimpleOperation {
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
    static transform(a: SimpleOperation, b: SimpleOperation): [SimpleOperation, SimpleOperation];
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
    private static transformInserts;
    private static transformInsertaAndDelete;
    private static transformDeleteAndInsert;
    private static transformDeletes;
    /**
     * Convert a normal, composable `TextOperation`, into an array of `SimpleTextOperation`s.
     *
     * @static
     * @param {TextOperation} operation
     * @returns {SimpleOperation[]}
     * @memberof SimpleOperation
     */
    static fromTextOperation(operation: TextOperation): SimpleOperation[];
}
export declare class SimpleNoop extends SimpleOperation {
    apply(document: string): string;
    toString(): string;
    toJson(): number;
    equals(other: SimpleOperation): boolean;
}
export declare class SimpleDelete extends SimpleOperation {
    count: number;
    position: number;
    constructor(count: number, position: number);
    apply(document: string): string;
    toString(): string;
    toJson(): number;
    equals(other: SimpleOperation): boolean;
}
export declare class SimpleInsert extends SimpleOperation {
    str: string;
    position: number;
    constructor(str: string, position: number);
    apply(document: string): string;
    toString(): string;
    toJson(): string;
    equals(other: SimpleOperation): boolean;
}
