import { TextOperation } from './TextOperation';
export declare class Range {
    anchor: number;
    head: number;
    constructor(anchor: number, head: number);
    static fromJSON(obj: {
        anchor: number;
        head: number;
    }): Range;
    equals(other: Range): boolean;
    isEmpty(): boolean;
    transform(operation: TextOperation): Range;
    private static transformIndex;
}
export declare class Selection {
    ranges: Range[];
    constructor(ranges?: Range[]);
    static createCursor(position: number): Selection;
    static fromJSON(obj: {
        ranges: {
            anchor: number;
            head: number;
        }[];
    }): Selection;
    equals(other: Selection): boolean;
    somethingSelected(): boolean;
    compose(other: Selection): Selection;
    transform(other: TextOperation): Selection;
}
