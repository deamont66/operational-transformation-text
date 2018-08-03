import { SimpleOperation, Noop, Insert, Delete } from '../../src/operations/SimpleOperation';
import { randomString, randomOperation, randomTest } from '../randomHelper';

/* Noop or Noop */

test('SimpleOperation transform with Noop', () => {
    const ins = new Insert('hello', 0);
    const del = new Delete(1, 0);
    const noop = new Noop();

    expect(SimpleOperation.transform(noop, ins)).toEqual([noop, ins]);
    expect(SimpleOperation.transform(ins, noop)).toEqual([ins, noop]);

    expect(SimpleOperation.transform(noop, del)).toEqual([noop, del]);
    expect(SimpleOperation.transform(del, noop)).toEqual([del, noop]);
});

/* Insert and Insert */

test('SimpleOperation transform two Inserts <', () => {
    const ins1 = new Insert('abc', 0);
    const ins2 = new Insert('def', 10);

    expect(SimpleOperation.transform(ins1, ins2)).toEqual([ins1, new Insert('def', 13)]);
});

test('SimpleOperation transform two Inserts >', () => {
    const ins1 = new Insert('abc', 10);
    const ins2 = new Insert('def', 0);

    expect(SimpleOperation.transform(ins1, ins2)).toEqual([new Insert('abc', 13), ins2]);
});

test('SimpleOperation transform two Inserts ==', () => {
    const ins1 = new Insert('abc', 10);
    const ins2 = new Insert('def', 10);

    expect(SimpleOperation.transform(ins1, ins1)).toEqual([new Noop(), new Noop()]);
    // prefer first in alphabetical order
    expect(SimpleOperation.transform(ins1, ins2)).toEqual([ins1, new Insert('def', 13)]);
    expect(SimpleOperation.transform(ins2, ins1)).toEqual([new Insert('def', 13), ins1]);
});

/* Insert and Delete */

test('SimpleOperation transform insert and delete <=', () => {
    const ins1 = new Insert('abc', 5);
    const del1 = new Delete(2, 7);
    const del2 = new Delete(2, 5);

    expect(SimpleOperation.transform(ins1, del1)).toEqual([ins1, new Delete(2, 10)]);
    expect(SimpleOperation.transform(ins1, del2)).toEqual([ins1, new Delete(2, 8)]);
});

test('SimpleOperation transform insert and delete >=', () => {
    const ins1 = new Insert('abc', 15);
    const del1 = new Delete(2, 7);
    const del2 = new Delete(2, 13);

    expect(SimpleOperation.transform(ins1, del1)).toEqual([new Insert('abc', 13), del1]);
    expect(SimpleOperation.transform(ins1, del2)).toEqual([new Insert('abc', 13), del2]);
});

test('SimpleOperation transform insert and delete overlap', () => {
    const ins1 = new Insert('abc', 15);
    const del1 = new Delete(2, 14);

    expect(SimpleOperation.transform(ins1, del1)).toEqual([new Noop(), new Delete(5, 14)]);
});

/* Delete and Insert */

test('SimpleOperation transform delete and insert <=', () => {
    const ins1 = new Insert('abc', 15);
    const del1 = new Delete(2, 7);
    const del2 = new Delete(2, 13);

    expect(SimpleOperation.transform(del1, ins1)).toEqual([del1, new Insert('abc', 13)]);
    expect(SimpleOperation.transform(del2, ins1)).toEqual([del2, new Insert('abc', 13)]);
});

test('SimpleOperation transform delete and insert >=', () => {
    const ins1 = new Insert('abc', 5);
    const del1 = new Delete(2, 7);
    const del2 = new Delete(2, 5);

    expect(SimpleOperation.transform(del1, ins1)).toEqual([new Delete(2, 10), ins1]);
    expect(SimpleOperation.transform(del2, ins1)).toEqual([new Delete(2, 8), ins1]);
});

test('SimpleOperation transform delete and insert overlap', () => {
    const ins1 = new Insert('abc', 15);
    const del1 = new Delete(2, 14);

    expect(SimpleOperation.transform(del1, ins1)).toEqual([new Delete(5, 14), new Noop()]);
});

/* Delete and Delete */

test('SimpleOperation transform deletes ==', () => {
    const del1 = new Delete(5, 16);
    const del2 = new Delete(4, 16);
    const del3 = new Delete(6, 16);

    expect(SimpleOperation.transform(del1, del1)).toEqual([new Noop(), new Noop()]);
    expect(SimpleOperation.transform(del1, del2)).toEqual([new Delete(1, 16), new Noop()]);
    expect(SimpleOperation.transform(del1, del3)).toEqual([new Noop(), new Delete(1, 16)]);
});

test('SimpleOperation transform deletes <', () => {
    const del1 = new Delete(4, 12);
    const del2 = new Delete(4, 16);
    const del3 = new Delete(1, 13);
    const del4 = new Delete(6, 13);

    expect(SimpleOperation.transform(del1, del2)).toEqual([del1, new Delete(4, 12)]);
    expect(SimpleOperation.transform(del1, del3)).toEqual([new Delete(3, 12), new Noop()]);
    expect(SimpleOperation.transform(del1, del4)).toEqual([new Delete(1, 12), new Delete(3, 12)]);
});

test('SimpleOperation transform deletes >', () => {
    const del1 = new Delete(4, 12);
    const del2 = new Delete(4, 8);
    const del3 = new Delete(6, 11);
    const del4 = new Delete(2, 11);

    expect(SimpleOperation.transform(del1, del2)).toEqual([new Delete(4, 8), del2]);
    expect(SimpleOperation.transform(del1, del3)).toEqual([new Noop(), new Delete(2, 11)]);
    expect(SimpleOperation.transform(del1, del4)).toEqual([new Delete(3, 11), new Delete(1, 11)]);
});

/* unknown operation */

test('SimpleOperation transform unknown operation type should throw exception', () => {
    expect(() => SimpleOperation.transform({} as SimpleOperation, {} as SimpleOperation)).toThrow(
        /unknown/
    );
});

test('SimpleOperation fromTextOperation', () => {
    randomTest(40, () => {
        let doc = randomString(40);
        const operation = randomOperation(doc);
        const doc1 = operation.apply(doc);
        const simpleOperations = SimpleOperation.fromTextOperation(operation);
        for (let j = 0; j < simpleOperations.length; j++) {
            doc = simpleOperations[j].apply(doc);
        }
        expect(doc).toBe(doc1);
    });
});
