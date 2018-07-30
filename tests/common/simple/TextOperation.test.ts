import { TextOperation, Retain, Insert, Delete } from '../../../src/common/TextOperation';
import { randomString, randomOperation, randomTest } from '../../randomHelper';

test('TextOperation constructor sets default field values', () => {
    const op = new TextOperation();

    expect(op.baseLength).toBe(0);
    expect(op.targetLength).toBe(0);
    expect(op.ops.length).toBe(0);
});

test('TextOperation lenght check', () => {
    const op = new TextOperation();

    expect(op.baseLength).toBe(0);
    expect(op.targetLength).toBe(0);
    op.retain(5);
    expect(op.baseLength).toBe(5);
    expect(op.targetLength).toBe(5);
    op.insert('abc');
    expect(op.baseLength).toBe(5);
    expect(op.targetLength).toBe(8);
    op.retain(2);
    expect(op.baseLength).toBe(7);
    expect(op.targetLength).toBe(10);
    op.delete(2);
    expect(op.baseLength).toBe(9);
    expect(op.targetLength).toBe(10);
});

test('TextOperation chaining', () => {
    const op = new TextOperation()
        .retain(5)
        .retain(0)
        .insert('lorem')
        .insert('')
        .delete('abc')
        .delete(3)
        .delete(0)
        .delete('');

    expect(op.ops.length).toBe(3);
});

test('TextOperation equals', () => {
    const op1 = new TextOperation()
        .delete(1)
        .insert('lo')
        .retain(2);

    const op2 = new TextOperation()
        .delete(-1)
        .insert('l')
        .insert('o')
        .retain(5);

    expect(op1.equals(op2)).toBeFalsy();
    op1.retain(3);
    expect(op1.equals(op2)).toBeTruthy();

    op1.delete(1);
    expect(op1.equals(op2)).toBeFalsy();
    op2.retain(1);
    expect(op1.equals(op2)).toBeFalsy();

    const op3 = new TextOperation();
    op3.insert('he');
    op3.retain(2);
    const op4 = new TextOperation();
    op4.retain(2);
    op4.insert('he');

    expect(op3.equals(op4)).toBeFalsy();

    op3.insert('he');
    op3.retain(1);
    op3.insert('h');
    op4.insert('heh');
    op4.retain(1);

    expect(op3.equals(op4)).toBeFalsy();
});

test('TextOperation ops merging', () => {
    const last = arr => arr[arr.length - 1];

    const op = new TextOperation();
    expect(op.ops.length).toBe(0);
    op.retain(2);
    expect(op.ops.length).toBe(1);
    expect(last(op.ops)).toEqual(new Retain(2));
    op.retain(3);
    expect(op.ops.length).toBe(1);
    expect(last(op.ops)).toEqual(new Retain(5));
    op.insert('abc');
    expect(op.ops.length).toBe(2);
    expect(last(op.ops)).toEqual(new Insert('abc'));
    op.insert('xyz');
    expect(op.ops.length).toBe(2);
    expect(last(op.ops)).toEqual(new Insert('abcxyz'));
    op.delete('d');
    expect(op.ops.length).toBe(3);
    expect(last(op.ops)).toEqual(new Delete(-1));
    op.delete('d');
    expect(op.ops.length).toBe(3);
    expect(last(op.ops)).toEqual(new Delete(-2));
});

test('TextOperation isNoop', () => {
    const op = new TextOperation();
    expect(op.isNoop()).toBeTruthy();
    op.retain(5);
    expect(op.isNoop()).toBeTruthy();
    op.retain(3);
    expect(op.isNoop()).toBeTruthy();
    op.insert('lorem');
    expect(op.isNoop()).toBeFalsy();
});

test('TextOperation isNoop', () => {
    const op = new TextOperation();
    op.retain(2);
    op.insert('lorem');
    op.delete('ipsum');
    op.retain(5);
    expect(op.toString()).toBe("retain 2, insert 'lorem', delete 5, retain 5");
});

test('TextOperation random json serialize', () => {
    randomTest(40, () => {
        const doc = randomString(50);
        const operation = randomOperation(doc);
        expect(operation.equals(TextOperation.fromJSON(operation.toJSON()))).toBeTruthy();
    });
});

test('TextOperation json deserialize', () => {
    const ops = [2, -1, -1, 'cde'];
    const op = TextOperation.fromJSON(ops);
    expect(op.ops.length).toBe(3);
    expect(op.baseLength).toBe(4);
    expect(op.targetLength).toBe(5);

    ops.push(null);
    expect(() => TextOperation.fromJSON(ops)).toThrow();
});

test('TextOperation apply', () => {
    const str = randomString(50);
    const op = randomOperation(str);

    expect(() => op.apply('not a 50 chars')).toThrow();

    op.ops.push(new Retain(1));
    expect(() => op.apply(str)).toThrow();
    const newLongerStr = str + '12';
    op.baseLength += 2;
    expect(() => op.apply(newLongerStr)).toThrow();

    randomTest(40, () => {
        const str = randomString(50);
        const op = randomOperation(str);

        expect(str.length).toBe(op.baseLength);
        expect(op.apply(str).length).toBe(op.targetLength);
    });
});
