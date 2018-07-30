import { Insert, Noop } from '../../../src/common/SimpleOperation';

test('Noop equals should check type', () => {
    const ins = new Insert('hello', 0);
    const noop = new Noop();

    expect(noop.equals(ins)).toBeFalsy();
});

test('Noop toString should return single value', () => {
    const noop = new Noop();

    expect(noop.toString()).toBe('Noop()');
});

test('Noop toJson should return 0', () => {
    const noop = new Noop();

    expect(noop.toJson()).toBe(0);
});

test('Noop apply should return unchange document', () => {
    const noop = new Noop();

    expect(noop.apply('1234567890')).toBe('1234567890');
});
