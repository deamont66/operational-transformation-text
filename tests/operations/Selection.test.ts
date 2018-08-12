import { Selection, Range } from '../../src/operations/Selection';
import { TextOperation } from '../../src/operations/TextOperation';

describe('Selection', () => {
    test('createCursor', () => {
        expect(Selection.createCursor(5).equals(new Selection([new Range(5, 5)]))).toBeTruthy();
    });

    test('fromJSON', () => {
        const selection = Selection.fromJSON({
            ranges: [{ anchor: 3, head: 5 }, { anchor: 11, head: 23 }]
        });
        expect(selection).toBeInstanceOf(Selection);
        expect(selection.ranges.length).toBe(2);
        expect(selection.ranges[0].equals(new Range(3, 5))).toBeTruthy();
        expect(selection.ranges[1].equals(new Range(11, 23))).toBeTruthy();
    });

    test('somethingSelected', () => {
        let selection = new Selection([new Range(7, 7), new Range(10, 10)]);
        expect(selection.somethingSelected()).toBeFalsy();

        selection = new Selection();
        expect(selection.somethingSelected()).toBeFalsy();

        selection = new Selection([new Range(7, 10)]);
        expect(selection.somethingSelected()).toBeTruthy();
    });

    test('transform', () => {
        const selection = new Selection([new Range(3, 7), new Range(0, 0), new Range(19, 21)]);
        expect(
            selection
                .transform(
                    new TextOperation()
                        .retain(3)
                        .insert('lorem')
                        .delete(2)
                        .retain(42)
                )
                .equals(new Selection([new Range(8, 10), new Range(0, 0), new Range(22, 24)]))
        ).toBeTruthy();
        expect(
            selection
                .transform(new TextOperation().delete(45))
                .equals(new Selection([new Range(0, 0), new Range(0, 0), new Range(0, 0)]))
        ).toBeTruthy();
    });

    test('compose', () => {
        const a = new Selection([new Range(3, 7)]);
        const b = Selection.createCursor(4);
        expect(a.compose(b)).toBe(b);
    });

    test('equal', () => {
        let a = new Selection([new Range(3, 7)]);
        let b = new Selection();
        expect(a.equals(b)).toBeFalsy();
        b = new Selection([new Range(5, 8)]);
        expect(a.equals(b)).toBeFalsy();
    });
});
