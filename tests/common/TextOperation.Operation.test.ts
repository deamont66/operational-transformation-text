import { Retain, Delete, Insert } from '../../src/operations/TextOperation';

test('Retain is retain and has correnct value', () => {
    const retain = new Retain(5);
    const retain2 = new Retain(5);
    const del = new Delete(-5);

    expect(retain.getNumberValue()).toBe(5);
    expect(() => retain.getStringValue()).toThrow();

    expect(retain.isRetain()).toBeTruthy();
    expect(retain.isDelete()).toBeFalsy();
    expect(retain.isInsert()).toBeFalsy();

    expect(retain.equals(retain2)).toBeTruthy();
    expect(retain.equals(del)).toBeFalsy();

    retain.add(-2);
    retain.add(3);
    expect(retain.getNumberValue()).toBe(10);

    expect(() => new Retain(-2)).toThrow(/length/);
});

test('Delete is delete and has correnct value', () => {
    const del = new Delete(-5);
    const del2 = new Delete(-5);
    const retain = new Retain(5);

    expect(del.getNumberValue()).toBe(-5);
    expect(() => del.getStringValue()).toThrow();

    expect(del.isRetain()).toBeFalsy();
    expect(del.isDelete()).toBeTruthy();
    expect(del.isInsert()).toBeFalsy();

    expect(del.equals(del2)).toBeTruthy();
    expect(del.equals(retain)).toBeFalsy();

    del.add(3);
    del.add(-2);
    expect(del.getNumberValue()).toBe(-10);

    expect(() => new Delete(2)).toThrow(/length/);
});

test('Insert is insert and has correnct value', () => {
    const ins = new Insert('hello');
    const ins2 = new Insert('hello');
    const del = new Delete(-5);

    expect(ins.getStringValue()).toBe('hello');
    expect(() => ins.getNumberValue()).toThrow();

    expect(ins.isRetain()).toBeFalsy();
    expect(ins.isDelete()).toBeFalsy();
    expect(ins.isInsert()).toBeTruthy();

    expect(ins.equals(ins2)).toBeTruthy();
    expect(ins.equals(del)).toBeFalsy();

    ins.add(' world');
    expect(ins.getStringValue()).toBe('hello world');
});

test('Operation toJSON', () => {
    expect(new Retain(5).toJSON()).toBe(5);
    expect(new Delete(-5).toJSON()).toBe(-5);
    expect(new Insert('ABC').toJSON()).toBe('ABC');
});
