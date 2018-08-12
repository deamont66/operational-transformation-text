import { SimpleDelete as Delete, SimpleNoop as Noop } from '../../src/operations/SimpleOperation';

test('Delete constructor should checked passed parameters', () => {
    expect(() => new Delete(0, 0)).toThrow(/count/);
    expect(() => new Delete(1, -5)).toThrow(/position/);
    expect(() => new Delete(1, 0)).not.toThrow();
});

test('Delete constructor should set passed parameters', () => {
    const del = new Delete(10, 5);
    expect(del.count).toBe(10);
    expect(del.position).toBe(5);
});

test('Delete equals should check type', () => {
    const del = new Delete(1, 0);
    const noop = new Noop();

    expect(del.equals(noop)).toBeFalsy();
});

test('Delete equals should check internal values', () => {
    const del1 = new Delete(10, 5);
    const del2 = new Delete(10, 5);
    const del3 = new Delete(1, 2);

    expect(del1.equals(del2)).toBeTruthy();
    expect(del1.equals(del3)).toBeFalsy();
});

test('Delete toString should return internal values', () => {
    const del = new Delete(7, 13);

    expect(del.toString()).toBe('Delete(7, 13)');
});

test('Delete toJson should return only negative count', () => {
    const del = new Delete(7, 13);

    expect(del.toJson()).toBe(-7);
});

test('Delete apply should remove only selected characters', () => {
    const del = new Delete(2, 4);

    expect(del.apply('1234567890')).toBe('12347890');
    expect(del.apply('12345')).toBe('1234');
});
