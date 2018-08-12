import { SelfSelection } from '../../src/operations/SelfSelection';
import { Selection } from '../../src/operations/Selection';
import { TextOperation } from '../../src/operations/TextOperation';
describe('SelfSelection', () => {
    describe('constructor', () => {
        it('should set selections', () => {
            const selection = Selection.createCursor(0);
            const selection2 = Selection.createCursor(1);

            const selfSelection = new SelfSelection(selection, selection2);
            expect(selfSelection.selectionBefore).toBe(selection);
            expect(selfSelection.selectionAfter).toBe(selection2);
        });
    });

    describe('invert', () => {
        it('should return new SelfSelection with swapped selections', () => {
            const selection = Selection.createCursor(0);
            const selection2 = Selection.createCursor(1);

            const selfSelection = new SelfSelection(selection, selection2);
            const ret = selfSelection.invert();

            expect(ret.selectionBefore).toBe(selection2);
            expect(ret.selectionAfter).toBe(selection);
        });
    });

    describe('compose', () => {
        it('should return new SelfSelection with afterSelection from other', () => {
            const selection = Selection.createCursor(0);
            const selection2 = Selection.createCursor(1);
            const selection3 = Selection.createCursor(2);

            const selfSelection = new SelfSelection(selection, selection2);
            const other = new SelfSelection(selection2, selection3);
            const ret = selfSelection.compose(other);

            expect(ret.selectionBefore).toBe(selection);
            expect(ret.selectionAfter).toBe(selection3);
        });
    });

    describe('transform', () => {
        it('should return new SelfSelection with transformed both before and after selection', () => {
            const selection = Selection.createCursor(0);
            const selection2 = Selection.createCursor(1);
            const retSelection = Selection.createCursor(2);
            const retSelection2 = Selection.createCursor(3);

            const operation = new TextOperation();
            selection.transform = jest.fn().mockReturnValueOnce(retSelection);
            selection2.transform = jest.fn().mockReturnValueOnce(retSelection2);

            const selfSelection = new SelfSelection(selection, selection2);

            const ret = selfSelection.transform(operation);

            expect(selection.transform).toBeCalledWith(operation);
            expect(selection2.transform).toBeCalledWith(operation);
            expect(ret.selectionBefore).toBe(retSelection);
            expect(ret.selectionAfter).toBe(retSelection2);
        });
    });
});
