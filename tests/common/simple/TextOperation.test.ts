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

test('TextOperation inverse', () => {
    const op = new TextOperation();
    op.insert('hello')
        .retain(2)
        .delete(1);
    const doc = 'abc';
    const newDoc = op.apply(doc);

    const inverse = op.invert(doc);
    expect(inverse.apply(newDoc)).toBe(doc);
});

test('TextOperation inverse random', () => {
    randomTest(40, () => {
        const doc = randomString(50);
        const op = randomOperation(doc);

        const newDoc = op.apply(doc);
        const inverse = op.invert(doc);
        expect(inverse.apply(newDoc)).toBe(doc);
    });
});

test('TextOperation compose', () => {
    const doc1 = 'abc';
    const op1 = new TextOperation();
    op1.insert('hello')
        .retain(1)
        .delete(1)
        .retain(1)
        .insert('?');

    const doc2 = op1.apply(doc1);
    const op2 = new TextOperation();
    op2.insert('second')
        .retain(5)
        .delete(2)
        .insert('zzz')
        .retain(1);

    const finDoc = op2.apply(doc2);
    const composeOp = op1.compose(op2);

    expect(composeOp.apply(doc1)).toBe(finDoc);
});

test('TextOperation compose errors', () => {
    const doc1 = 'abc';
    const op1 = new TextOperation();
    op1.retain(3).insert('?');

    const doc2 = op1.apply(doc1);
    const op2 = new TextOperation();
    op2.retain(4).insert('_');

    expect(() => op2.compose(op1)).toThrow();

    op1.baseLength = 0;
    expect(() => op2.compose(op1)).toThrow();

    op2.targetLength = 0;
    op1.insert('123');
    op1.baseLength = 0;
    op2.targetLength = 0;
    expect(() => op2.compose(op1)).toThrow();

    const op3 = new TextOperation();
    op3.retain(3);
    op3.baseLength = 0;
    const op4 = new TextOperation();
    expect(() => op4.compose(op3)).toThrow();
});

test('TextOperation compose random', () => {
    randomTest(40, () => {
        const doc1 = randomString(50);
        const op1 = randomOperation(doc1);

        const doc2 = op1.apply(doc1);
        const op2 = randomOperation(doc2);

        const finDoc = op2.apply(doc2);
        const composeOp = op1.compose(op2);

        expect(composeOp.apply(doc1)).toBe(finDoc);
    });
});

test('TextOperation shouldBeComposedWith', () => {
    let a = new TextOperation().retain(3);
    let b = new TextOperation()
        .retain(1)
        .insert('tag')
        .retain(2);

    expect(a.shouldBeComposedWith(b)).toBeTruthy();
    expect(b.shouldBeComposedWith(a)).toBeTruthy();

    a = new TextOperation()
        .retain(1)
        .insert('a')
        .retain(2);
    b = new TextOperation()
        .retain(2)
        .insert('b')
        .retain(2);
    expect(a.shouldBeComposedWith(b)).toBeTruthy();
    a.delete(3);
    expect(a.shouldBeComposedWith(b)).toBeFalsy();

    a = new TextOperation()
        .retain(1)
        .insert('b')
        .retain(2);
    b = new TextOperation()
        .retain(1)
        .insert('a')
        .retain(3);
    expect(a.shouldBeComposedWith(b)).toBeFalsy();

    a = new TextOperation()
        .retain(4)
        .delete(3)
        .retain(10);
    b = new TextOperation()
        .retain(2)
        .delete(2)
        .retain(10);
    expect(a.shouldBeComposedWith(b)).toBeTruthy();
    b = new TextOperation()
        .retain(4)
        .delete(7)
        .retain(3);
    expect(a.shouldBeComposedWith(b)).toBeTruthy();
    b = new TextOperation()
        .retain(2)
        .delete(9)
        .retain(3);
    expect(a.shouldBeComposedWith(b)).toBeFalsy();

    a = new TextOperation().insert('a').delete(1);
    b = new TextOperation().insert('_');
    expect(a.shouldBeComposedWith(b)).toBeFalsy();

    a = new TextOperation().insert('a');
    b = new TextOperation().delete(1);
    expect(a.shouldBeComposedWith(b)).toBeFalsy();
});

test('TextOperation shouldBeComposedWith', () => {
    let a = new TextOperation().insert('a');
    let b = new TextOperation().insert('tag');

    expect(a.shouldBeComposedWithInverted(b)).toBeTruthy();
    expect(b.shouldBeComposedWithInverted(a)).toBeTruthy();

    a = new TextOperation();
    expect(a.shouldBeComposedWithInverted(b)).toBeTruthy();
    a.insert('_')
        .retain(2)
        .delete(1)
        .insert('a');
    expect(a.shouldBeComposedWithInverted(b)).toBeFalsy();

    a = new TextOperation().insert('a').retain(1);
    b = new TextOperation().retain(1).insert('a');
    expect(a.shouldBeComposedWithInverted(b)).toBeTruthy();

    a = new TextOperation().delete('a').retain(1);
    b = new TextOperation()
        .retain(1)
        .delete('a')
        .retain(2);
    expect(a.shouldBeComposedWithInverted(b)).toBeFalsy();
    b = new TextOperation()
        .delete(1)
        .retain(5)
        .delete(2);
    expect(a.shouldBeComposedWithInverted(b)).toBeFalsy();

    a = new TextOperation().insert('a');
    b = new TextOperation().delete(1);
    expect(a.shouldBeComposedWithInverted(b)).toBeFalsy();
});

test('TextOperation shouldBeComposedWith random', () => {
    // invariant: shouldBeComposedWith(a, b) = shouldBeComposedWithInverted(b^{-1}, a^{-1})
    randomTest(100, () => {
        const str = randomString(1);
        const a = randomOperation(str);
        const aInv = a.invert(str);
        const afterA = a.apply(str);
        const b = randomOperation(afterA);
        const bInv = b.invert(afterA);

        expect(a.shouldBeComposedWith(b)).toBe(bInv.shouldBeComposedWithInverted(aInv));
    });
});

test('TextOperation transform', () => {
    let doc = '1';
    let a = new TextOperation().insert('2').retain(1);
    let b = new TextOperation().delete(1).insert('a');

    let [transformA, transformB] = TextOperation.transform(a, b);
    expect(transformB.apply(a.apply(doc))).toBe(transformA.apply(b.apply(doc)));
});

test('TextOperation transform random', () => {
    randomTest(40, () => {
        // invariant: compose(a, b') = compose(b, a') where (a', b') = transform(a, b)
        const doc = randomString(50);
        const a = randomOperation(doc);
        const b = randomOperation(doc);

        const [aPrime, bPrime] = TextOperation.transform(a, b);
        const abPrime = a.compose(bPrime);
        const baPrime = b.compose(aPrime);
        const afterAbPrime = abPrime.apply(doc);
        const afterBaPrime = baPrime.apply(doc);

        expect(abPrime.equals(baPrime)).toBeTruthy();
        expect(afterAbPrime).toBe(afterBaPrime);
    });
});
