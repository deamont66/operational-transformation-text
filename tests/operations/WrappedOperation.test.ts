import { WrappedOperation } from '../../src/operations/WrappedOperation';
import { TextOperation } from '../../src/operations/TextOperation';
import { Selection } from '../../src/operations/Selection';
import { SelfSelection } from '../../src/operations/SelfSelection';

test('WrappedOperation apply mock test', () => {
    const testOperation = new TextOperation();
    const op = new WrappedOperation(
        testOperation,
        new SelfSelection(Selection.createCursor(1), Selection.createCursor(0))
    );

    testOperation.apply = jest.fn().mockReturnValue('a123');

    const ret = op.apply('a');

    expect(testOperation.apply).toBeCalledWith('a');
    expect(ret).toBe('a123');
});

test('WrappedOperation invert mock test', () => {
    const testOperation = new TextOperation();
    const selection = new SelfSelection(Selection.createCursor(1), Selection.createCursor(0));
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
    const selection = new SelfSelection(Selection.createCursor(1), Selection.createCursor(0));
    const selection2 = new SelfSelection(Selection.createCursor(1), Selection.createCursor(2));
    const op = new WrappedOperation(testOperation, selection);
    const op2 = new WrappedOperation(testOperation2, selection2);
    const op3 = new WrappedOperation(testOperation2, null);

    const retTextOperation = new TextOperation();
    const retSelection = new Selection();
    testOperation.compose = jest.fn().mockReturnValue(retTextOperation);
    selection.compose = jest.fn().mockReturnValue(retSelection);

    let result = op.compose(op2);

    expect(result).toBeInstanceOf(WrappedOperation);
    expect(testOperation.compose).toBeCalledWith(testOperation2);
    expect(selection.compose).toBeCalledWith(selection2);
    expect(result.operation).toBe(retTextOperation);
    expect(result.selection).toBe(retSelection);

    result = op.compose(op3);
    (selection.compose as any).mockClear();

    expect(result).toBeInstanceOf(WrappedOperation);
    expect(testOperation.compose).toBeCalledWith(testOperation2);
    expect(selection.compose).not.toBeCalled();
    expect(result.operation).toBe(retTextOperation);
    expect(result.selection).toBe(null);
});

test('WrappedOperation transform mock test', () => {
    const testOperation = new TextOperation();
    const testOperation2 = new TextOperation();
    const selection = new SelfSelection(Selection.createCursor(1), Selection.createCursor(0));
    const selection2 = new SelfSelection(Selection.createCursor(1), Selection.createCursor(2));

    const op = new WrappedOperation(testOperation, selection);
    const op2 = new WrappedOperation(testOperation2, selection2);

    const retTextOperation0 = new TextOperation();
    const retTextOperation1 = new TextOperation();
    const retSelection0 = new Selection();
    const retSelection1 = new Selection();
    TextOperation.transform = jest.fn().mockReturnValue([retTextOperation0, retTextOperation1]);
    selection.transform = jest.fn().mockReturnValue(retSelection0);
    selection2.transform = jest.fn().mockReturnValue(retSelection1);

    const [result0, result1] = WrappedOperation.transform(op, op2);
    expect(TextOperation.transform).toBeCalledWith(testOperation, testOperation2);
    expect(selection.transform).toBeCalledWith(testOperation2);
    expect(selection2.transform).toBeCalledWith(testOperation);

    expect(result0.operation).toBe(retTextOperation0);
    expect(result0.selection).toBe(retSelection0);
    expect(result1.operation).toBe(retTextOperation1);
    expect(result1.selection).toBe(retSelection1);
});

test('WrappedOperation transform mock test without selection', () => {
    const testOperation = new TextOperation();
    const testOperation2 = new TextOperation();

    const op = new WrappedOperation(testOperation, null);
    const op2 = new WrappedOperation(testOperation2, null);

    const retTextOperation0 = new TextOperation();
    const retTextOperation1 = new TextOperation();
    const retSelection0 = new Selection();
    const retSelection1 = new Selection();
    TextOperation.transform = jest.fn().mockReturnValue([retTextOperation0, retTextOperation1]);

    const [result0, result1] = WrappedOperation.transform(op, op2);
    expect(TextOperation.transform).toBeCalledWith(testOperation, testOperation2);

    expect(result0.operation).toBe(retTextOperation0);
    expect(result0.selection).toBe(null);
    expect(result1.operation).toBe(retTextOperation1);
    expect(result1.selection).toBe(null);
});
