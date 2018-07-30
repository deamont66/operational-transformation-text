import { TextOperation } from '../src/common/TextOperation';

export const randomInt = (n: number): number => {
    return Math.floor(Math.random() * n);
};

export const randomString = (n: number): string => {
    let str: string = '';
    while (n--) {
        if (Math.random() < 0.15) {
            str += '\n';
        } else {
            var chr = randomInt(26) + 97;
            str += String.fromCharCode(chr);
        }
    }
    return str;
};

export const randomOperation = (str: string): TextOperation => {
    const operation: TextOperation = new TextOperation();
    let left: number;
    while (true) {
        left = str.length - operation.baseLength;
        if (left === 0) {
            break;
        }
        const r: number = Math.random();
        const l: number = 1 + randomInt(Math.min(left - 1, 20));
        if (r < 0.2) {
            operation.insert(randomString(l));
        } else if (r < 0.4) {
            operation.delete(l);
        } else {
            operation.retain(l);
        }
    }
    if (Math.random() < 0.3) {
        operation.insert(1 + randomString(10));
    }
    return operation;
};

interface randomTestCallbackType {
    (): void;
}
export const randomTest = (n: number, callback: randomTestCallbackType) => {
    for (let i = 0; i < 50; i++) {
        callback();
    }
};
