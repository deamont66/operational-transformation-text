import { WrappedOperation } from '../../src/operations/WrappedOperation';
import { TextOperation } from '../../src/operations/TextOperation';
import { Selection } from '../../src/operations/Selection';

jest.mock('../../src/operations/TextOperation');
jest.mock('../../src/operations/Selection');

test('WrappedOperation apply mock test', () => {
    const testOperation = new TextOperation();
    const op = new WrappedOperation(testOperation, Selection.createCursor(1));

    testOperation.apply = jest.fn().mockReturnValue('a123');

    const ret = op.apply('a');

    expect(testOperation.apply).toBeCalledWith('a');
    expect(ret).toBe('a123');
});

test('WrappedOperation invert mock test', () => {
    const testOperation = new TextOperation();
    const selection = Selection.createCursor(1);
    const op = new WrappedOperation(testOperation, selection);

    const retTextOperation = new TextOperation();
    testOperation.invert = jest.fn().mockReturnValue(retTextOperation);

    const result = op.invert('a');
    expect(result).toBeInstanceOf(WrappedOperation);
    expect(testOperation.invert).toBeCalledWith('a');
    expect(result.operation).toBe(retTextOperation);
    expect(result.selection).toBe(selection);
});

test('WrappedOperation compose mock test', () => {
    const testOperation = new TextOperation();
    const testOperation2 = new TextOperation();
    const selection = new Selection();
    const selection2 = new Selection();
    const op = new WrappedOperation(testOperation, selection);
    const op2 = new WrappedOperation(testOperation2, selection2);

    const retTextOperation = new TextOperation();
    const retSelection = new Selection();
    testOperation.compose = jest.fn().mockReturnValue(retTextOperation);
    selection.compose = jest.fn().mockReturnValue(retSelection);

    const result = op.compose(op2);

    expect(result).toBeInstanceOf(WrappedOperation);
    expect(testOperation.compose).toBeCalledWith(testOperation2);
    expect(selection.compose).toBeCalledWith(selection2);
    expect(result.operation).toBe(retTextOperation);
    expect(result.selection).toBe(retSelection);
});

test('WrappedOperation transform mock test', () => {
    const testOperation = new TextOperation();
    const testOperation2 = new TextOperation();
    const selection = new Selection();
    const selection2 = new Selection();

    const op = new WrappedOperation(testOperation, selection);
    const op2 = new WrappedOperation(testOperation2, selection2);

    const retTextOperation0 = new TextOperation();
    const retTextOperation1 = new TextOperation();
    const retSelection0 = new Selection();
    const retSelection1 = new Selection();
    TextOperation.transform = jest.fn().mockReturnValue([retTextOperation0, retTextOperation1]);
    selection.transform = jest.fn().mockReturnValue(retSelection0);
    selection2.transform = jest.fn().mockReturnValue(retSelection1);

    const result = WrappedOperation.transform(op, op2);
});
