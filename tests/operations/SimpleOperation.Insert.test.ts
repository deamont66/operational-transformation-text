import { SimpleInsert as Insert, SimpleNoop as Noop } from '../../src/operations/SimpleOperation';

test('Insert constructor should checked passed parameters', () => {
    expect(() => new Insert('', 0)).toThrow(/str/);
    expect(() => new Insert('a', -5)).toThrow(/position/);
    expect(() => new Insert('a', 0)).not.toThrow();
});

test('Insert constructor should set passed parameters', () => {
    const ins = new Insert('abc', 5);
    expect(ins.str).toBe('abc');
    expect(ins.position).toBe(5);
});

test('Insert equals should check type', () => {
    const ins = new Insert('hello', 0);
    const noop = new Noop();

    expect(ins.equals(noop)).toBeFalsy();
});

test('Insert equals should check internal values', () => {
    const ins1 = new Insert('abc', 5);
    const ins2 = new Insert('abc', 5);
    const ins3 = new Insert('no', 10);

    expect(ins1.equals(ins2)).toBeTruthy();
    expect(ins1.equals(ins3)).toBeFalsy();
});

test('Insert toString should return internal values', () => {
    const ins = new Insert('abc', 13);

    expect(ins.toString()).toBe('Insert(abc, 13)');
});

test('Insert toJson should return only str', () => {
    const ins = new Insert('hello', 13);

    expect(ins.toJson()).toBe('hello');
});

test('Insert apply should only insert characters to given position', () => {
    const ins = new Insert('abc', 3);

    expect(ins.apply('1234567890')).toBe('123abc4567890');
    expect(ins.apply('1')).toBe('1abc');
});
