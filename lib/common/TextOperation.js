"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Operation = /** @class */ (function () {
    function Operation() {
    }
    Operation.prototype.isRetain = function () {
        return this.constructor.name === 'Retain' && this.getNumberValue() !== 0;
    };
    Operation.prototype.isDelete = function () {
        return this.constructor.name === 'Delete' && this.getNumberValue() !== 0;
    };
    Operation.prototype.isInsert = function () {
        return this.constructor.name === 'Insert';
    };
    Operation.prototype.toJSON = function () {
        return this.isInsert() ? this.getStringValue() : this.getNumberValue();
    };
    return Operation;
}());
var Retain = /** @class */ (function (_super) {
    __extends(Retain, _super);
    function Retain(length) {
        var _this = _super.call(this) || this;
        if (length < 0) {
            throw new Error('length must be positive or zero');
        }
        _this.length = length;
        return _this;
    }
    Retain.prototype.getNumberValue = function () {
        return this.length;
    };
    Retain.prototype.getStringValue = function () {
        throw new Error('Retain does not have string value');
    };
    Retain.prototype.add = function (add) {
        if (add < 0)
            add = -add;
        this.length += add;
    };
    Retain.prototype.equals = function (other) {
        return other instanceof Retain && this.getNumberValue() === other.getNumberValue();
    };
    return Retain;
}(Operation));
exports.Retain = Retain;
var Delete = /** @class */ (function (_super) {
    __extends(Delete, _super);
    function Delete(length) {
        var _this = _super.call(this) || this;
        if (length > 0) {
            throw new Error('length must be negative or zero');
        }
        _this.length = length;
        return _this;
    }
    Delete.prototype.getNumberValue = function () {
        return this.length;
    };
    Delete.prototype.getStringValue = function () {
        throw new Error('Delete does not have string value');
    };
    Delete.prototype.add = function (add) {
        if (add > 0)
            add = -add;
        this.length += add;
    };
    Delete.prototype.equals = function (other) {
        return other instanceof Delete && this.getNumberValue() === other.getNumberValue();
    };
    return Delete;
}(Operation));
exports.Delete = Delete;
var Insert = /** @class */ (function (_super) {
    __extends(Insert, _super);
    function Insert(str) {
        var _this = _super.call(this) || this;
        _this.str = str;
        return _this;
    }
    Insert.prototype.getNumberValue = function () {
        throw new Error('Retain does not have number value');
    };
    Insert.prototype.getStringValue = function () {
        return this.str;
    };
    Insert.prototype.add = function (add) {
        this.str += add;
    };
    Insert.prototype.equals = function (other) {
        return other instanceof Insert && this.getStringValue() === other.getStringValue();
    };
    return Insert;
}(Operation));
exports.Insert = Insert;
/**
 * Operation is essentially list of `Operation`s. There are three types of ops:
 * Retain ops: Advance the cursor position by a given number of characters.
 *  Represented by positive ints.
 * Insert ops: Insert a given string at the current cursor position.
 *  Represented by strings.
 * Delete ops: Delete the next n characters. Represented by negative ints.
 *
 * After an operation is constructed, the user of the library can specify the
 * actions of an operation (skip/insert/delete) with these three builder
 * methods. They all return the operation for convenient chaining.
 *
 * @export
 * @class TextOperation
 */
var TextOperation = /** @class */ (function () {
    function TextOperation() {
        this.ops = [];
        this.baseLength = 0;
        this.targetLength = 0;
    }
    TextOperation.prototype.equals = function (other) {
        if (this.baseLength !== other.baseLength) {
            return false;
        }
        if (this.targetLength !== other.targetLength) {
            return false;
        }
        if (this.ops.length !== other.ops.length) {
            return false;
        }
        for (var i = 0; i < this.ops.length; i++) {
            if (!this.ops[i].equals(other.ops[i])) {
                return false;
            }
        }
        return true;
    };
    /**
     * Skip over a given number of characters.
     *
     * @param {number} length
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    TextOperation.prototype.retain = function (length) {
        if (length === 0)
            return this;
        this.baseLength += length;
        this.targetLength += length;
        if (this.ops.length > 0 && this.ops[this.ops.length - 1].isRetain()) {
            // The last op is a retain op => we can merge them into one op.
            this.ops[this.ops.length - 1].add(length);
        }
        else {
            // Create a new op.
            this.ops.push(new Retain(length));
        }
        return this;
    };
    /**
     * Insert a string at the current position.
     *
     * @param {string} str
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    TextOperation.prototype.insert = function (str) {
        if (str === '')
            return this;
        this.targetLength += str.length;
        if (this.ops.length > 0 && this.ops[this.ops.length - 1].isInsert()) {
            // Merge insert op.
            this.ops[this.ops.length - 1].add(str);
        }
        else if (this.ops.length > 0 && this.ops[this.ops.length - 1].isDelete()) {
            // It doesn't matter when an operation is applied whether the operation
            // is delete(3), insert("something") or insert("something"), delete(3).
            // Here we enforce that in this case, the insert op always comes first.
            // This makes all operations that have the same effect when applied to
            // a document of the right length equal in respect to the `equals` method.
            if (this.ops.length > 1 && this.ops[this.ops.length - 2].isInsert()) {
                this.ops[this.ops.length - 2].add(str);
            }
            else {
                this.ops[this.ops.length] = this.ops[this.ops.length - 1];
                this.ops[this.ops.length - 2] = new Insert(str);
            }
        }
        else {
            this.ops.push(new Insert(str));
        }
        return this;
    };
    /**
     * Delete a string at the current position.
     *
     * @param {(number | string)} length
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    TextOperation.prototype.delete = function (length) {
        if (typeof length === 'string') {
            length = length.length;
        }
        if (length === 0)
            return this;
        if (length > 0) {
            length = -length;
        }
        this.baseLength -= length;
        if (this.ops.length > 0 && this.ops[this.ops.length - 1].isDelete()) {
            this.ops[this.ops.length - 1].add(length);
        }
        else {
            this.ops.push(new Delete(length));
        }
        return this;
    };
    /**
     * Tests whether this operation has no effect.
     *
     * @returns {boolean}
     * @memberof TextOperation
     */
    TextOperation.prototype.isNoop = function () {
        return this.ops.length === 0 || (this.ops.length === 1 && this.ops[0].isRetain());
    };
    /**
     * Pretty printing.
     *
     * @returns {string}
     * @memberof TextOperation
     */
    TextOperation.prototype.toString = function () {
        return this.ops
            .map(function (op) {
            if (op.isRetain()) {
                return 'retain ' + op.getNumberValue();
            }
            else if (op.isInsert()) {
                return "insert '" + op.getStringValue() + "'";
            }
            else {
                return 'delete ' + -op.getNumberValue();
            }
        })
            .join(', ');
    };
    /**
     * Converts operation into a JSON value.
     *
     * @returns {((string | number)[])}
     * @memberof TextOperation
     */
    TextOperation.prototype.toJSON = function () {
        return this.ops.map(function (op) {
            if (op.isRetain() || op.isDelete()) {
                return op.getNumberValue();
            }
            else {
                // if (op.isInsert())
                return op.getStringValue();
            }
        });
    };
    /**
     * Converts a plain JS object into an operation and validates it.
     *
     * @static
     * @param {(string | number)[]} operations
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    TextOperation.fromJSON = function (operations) {
        var o = new TextOperation();
        operations.forEach(function (op) {
            if (typeof op === 'number') {
                if (op < 0) {
                    o.delete(op);
                }
                else {
                    o.retain(op);
                }
            }
            else if (typeof op === 'string') {
                o.insert(op);
            }
            else {
                throw new Error('Incorrect format of operation');
            }
        });
        return o;
    };
    /**
     * Apply an operation to a string, returning a new string. Throws an error if
     * there's a mismatch between the input string and the operation.
     *
     * @param {string} str
     * @returns {string}
     * @memberof TextOperation
     */
    TextOperation.prototype.apply = function (str) {
        if (str.length !== this.baseLength) {
            throw new Error("The operation's base length must be equal to the string's length.");
        }
        var newStr = [];
        var j = 0;
        var strIndex = 0;
        for (var i = 0, l = this.ops.length; i < l; i++) {
            var op = this.ops[i];
            if (op.isRetain()) {
                if (strIndex + op.getNumberValue() > str.length) {
                    throw new Error("Operation can't retain more characters than are left in the string.");
                }
                newStr[j++] = str.slice(strIndex, strIndex + op.getNumberValue());
                strIndex += op.getNumberValue();
            }
            else if (op.isInsert()) {
                newStr[j++] = op.getStringValue();
            }
            else {
                strIndex -= op.getNumberValue();
            }
        }
        if (strIndex !== str.length) {
            throw new Error("The operation didn't operate on the whole string.");
        }
        return newStr.join('');
    };
    /**
     * Computes the inverse of an operation. The inverse of an operation is the
     * operation that reverts the effects of the operation, e.g. when you have an
     * operation 'insert("hello "); skip(6);' then the inverse is 'delete("hello ");
     * skip(6);'. The inverse should be used for implementing undo.
     *
     * @param {string} str
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    TextOperation.prototype.invert = function (str) {
        var strIndex = 0;
        var inverse = new TextOperation();
        for (var i = 0, l = this.ops.length; i < l; i++) {
            var op = this.ops[i];
            if (op.isRetain()) {
                inverse.retain(op.getNumberValue());
                strIndex += op.getNumberValue();
            }
            else if (op.isInsert()) {
                inverse.delete(op.getStringValue().length);
            }
            else {
                // delete op
                inverse.insert(str.slice(strIndex, strIndex - op.getNumberValue()));
                strIndex -= op.getNumberValue();
            }
        }
        return inverse;
    };
    /**
     * Compose merges two consecutive operations into one operation, that
     * preserves the changes of both. Or, in other words, for each input string S
     * and a pair of consecutive operations A and B,
     * apply(apply(S, A), B) = apply(S, compose(A, B)) must hold.
     *
     * @param {TextOperation} other
     * @returns {TextOperation}
     * @memberof TextOperation
     */
    TextOperation.prototype.compose = function (other) {
        if (this.targetLength !== other.baseLength) {
            throw new Error('The base length of the second operation has to be the target length of the first operation');
        }
        var retOperation = new TextOperation(); // the combined operation
        var i1 = 0, i2 = 0; // current index into this.ops respectively other.ops
        var op1 = this.ops[i1++], op2 = other.ops[i2++]; // current ops
        while (true) {
            // Dispatch on the type of op1 and op2
            if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
                // end condition: both this.ops and other.ops have been processed
                break;
            }
            if (typeof op1 !== 'undefined' && op1.isDelete()) {
                retOperation.delete(op1.getNumberValue());
                op1 = this.ops[i1++];
                continue;
            }
            if (typeof op2 !== 'undefined' && op2.isInsert()) {
                retOperation.insert(op2.getStringValue());
                op2 = other.ops[i2++];
                continue;
            }
            if (typeof op1 === 'undefined') {
                throw new Error('Cannot compose operations: first operation is too short.');
            }
            if (typeof op2 === 'undefined') {
                throw new Error('Cannot compose operations: second operation is too long.');
            }
            if (op1.isRetain() && op2.isRetain()) {
                var op1Length = op1.getNumberValue();
                var op2Length = op2.getNumberValue();
                if (op1Length > op2Length) {
                    retOperation.retain(op2Length);
                    op1 = new Retain(op1Length - op2Length);
                    op2 = other.ops[i2++];
                }
                else if (op1Length === op2Length) {
                    retOperation.retain(op1Length);
                    op1 = this.ops[i1++];
                    op2 = other.ops[i2++];
                }
                else {
                    retOperation.retain(op1Length);
                    op2 = new Retain(op2Length - op1Length);
                    op1 = this.ops[i1++];
                }
            }
            else if (op1.isInsert() && op2.isDelete()) {
                var op1String = op1.getStringValue();
                var op2Length = op2.getNumberValue();
                if (op1String.length > -op2Length) {
                    op1 = new Insert(op1String.slice(-op2Length));
                    op2 = other.ops[i2++];
                }
                else if (op1String.length === -op2Length) {
                    op1 = this.ops[i1++];
                    op2 = other.ops[i2++];
                }
                else {
                    op2 = new Delete(op2Length + op1String.length);
                    op1 = this.ops[i1++];
                }
            }
            else if (op1.isInsert() && op2.isRetain()) {
                var op1String = op1.getStringValue();
                var op2Length = op2.getNumberValue();
                if (op1String.length > op2Length) {
                    retOperation.insert(op1String.slice(0, op2Length));
                    op1 = new Insert(op1String.slice(op2Length));
                    op2 = other.ops[i2++];
                }
                else if (op1String.length === op2Length) {
                    retOperation.insert(op1String);
                    op1 = this.ops[i1++];
                    op2 = other.ops[i2++];
                }
                else {
                    retOperation.insert(op1String);
                    op2 = new Retain(op2Length - op1String.length);
                    op1 = this.ops[i1++];
                }
            }
            else {
                // if (op1.isRetain() && op2.isDelete())
                var op1Length = op1.getNumberValue();
                var op2Length = op2.getNumberValue();
                if (op1Length > -op2Length) {
                    retOperation.delete(op2Length);
                    op1 = new Retain(op1Length + op2Length);
                    op2 = other.ops[i2++];
                }
                else if (op1Length === -op2Length) {
                    retOperation.delete(op2Length);
                    op1 = this.ops[i1++];
                    op2 = other.ops[i2++];
                }
                else {
                    retOperation.delete(op1Length);
                    op2 = new Delete(op2Length + op1Length);
                    op1 = this.ops[i1++];
                }
            }
        }
        return retOperation;
    };
    TextOperation.getSimpleOp = function (operation) {
        switch (operation.ops.length) {
            case 1:
                return operation.ops[0];
            case 2:
                return operation.ops[0].isRetain()
                    ? operation.ops[1]
                    : operation.ops[1].isRetain()
                        ? operation.ops[0]
                        : null;
            case 3:
                if (operation.ops[0].isRetain() && operation.ops[2].isRetain()) {
                    return operation.ops[1];
                }
        }
        return null;
    };
    TextOperation.getStartIndex = function (operation) {
        if (operation.ops[0].isRetain()) {
            return operation.ops[0].getNumberValue();
        }
        return 0;
    };
    /**
     * When you use ctrl-z to undo your latest changes, you expect the program not
     * to undo every single keystroke but to undo your last sentence you wrote at
     * a stretch or the deletion you did by holding the backspace key down. This
     * This can be implemented by composing operations on the undo stack. This
     * method can help decide whether two operations should be composed. It
     * returns true if the operations are consecutive insert operations or both
     * operations delete text at the same position. You may want to include other
     * factors like the time since the last change in your decision (feel free to
     * override this method in your children class).
     *
     * @param {TextOperation} other
     * @returns {boolean}
     * @memberof TextOperation
     */
    TextOperation.prototype.shouldBeComposedWith = function (other) {
        if (this.isNoop() || other.isNoop()) {
            return true;
        }
        var startA = TextOperation.getStartIndex(this), startB = TextOperation.getStartIndex(other);
        var simpleA = TextOperation.getSimpleOp(this), simpleB = TextOperation.getSimpleOp(other);
        if (!simpleA || !simpleB) {
            return false;
        }
        if (simpleA.isInsert() && simpleB.isInsert()) {
            return startA + simpleA.getStringValue().length === startB;
        }
        if (simpleA.isDelete() && simpleB.isDelete()) {
            // there are two possibilities to delete: with backspace and with the
            // delete key.
            return startB - simpleB.getNumberValue() === startA || startA === startB;
        }
        return false;
    };
    /**
     * Decides whether two operations should be composed with each other
     * if they were inverted, that is
     * `shouldBeComposedWith(a, b) = shouldBeComposedWithInverted(b^{-1}, a^{-1})`.
     *
     * @param {TextOperation} other
     * @returns {boolean}
     * @memberof TextOperation
     */
    TextOperation.prototype.shouldBeComposedWithInverted = function (other) {
        if (this.isNoop() || other.isNoop()) {
            return true;
        }
        var startA = TextOperation.getStartIndex(this), startB = TextOperation.getStartIndex(other);
        var simpleA = TextOperation.getSimpleOp(this), simpleB = TextOperation.getSimpleOp(other);
        if (!simpleA || !simpleB) {
            return false;
        }
        if (simpleA.isInsert() && simpleB.isInsert()) {
            return startA + simpleA.getStringValue().length === startB || startA === startB;
        }
        if (simpleA.isDelete() && simpleB.isDelete()) {
            return startB - simpleB.getNumberValue() === startA;
        }
        return false;
    };
    /**
     * Transform takes two operations A and B that happened concurrently and
     * produces two operations A' and B' (in an array) such that
     * `apply(apply(S, A), B') = apply(apply(S, B), A')`. This function is the
     * heart of OT.
     *
     * @static
     * @param {TextOperation} operation1
     * @param {TextOperation} operation2
     * @returns {[TextOperation, TextOperation]}
     * @memberof TextOperation
     */
    TextOperation.transform = function (operation1, operation2) {
        if (operation1.baseLength !== operation2.baseLength) {
            throw new Error('Both operations have to have the same base length');
        }
        var operation1prime = new TextOperation();
        var operation2prime = new TextOperation();
        var i1 = 0, i2 = 0;
        var op1 = operation1.ops[i1++], op2 = operation2.ops[i2++];
        while (true) {
            // At every iteration of the loop, the imaginary cursor that both
            // operation1 and operation2 have that operates on the input string must
            // have the same position in the input string.
            if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
                // end condition: both ops1 and ops2 have been processed
                break;
            }
            // next two cases: one or both ops are insert ops
            // => insert the string in the corresponding prime operation, skip it in
            // the other one. If both op1 and op2 are insert ops, prefer op1.
            if (typeof op1 !== 'undefined' && op1.isInsert()) {
                operation1prime.insert(op1.getStringValue());
                operation2prime.retain(op1.getStringValue().length);
                op1 = operation1.ops[i1++];
                continue;
            }
            if (typeof op2 !== 'undefined' && op2.isInsert()) {
                operation1prime.retain(op2.getStringValue().length);
                operation2prime.insert(op2.getStringValue());
                op2 = operation2.ops[i2++];
                continue;
            }
            if (typeof op1 === 'undefined') {
                throw new Error('Cannot compose operations: first operation is too short.');
            }
            if (typeof op2 === 'undefined') {
                throw new Error('Cannot compose operations: second operation is too short.');
            }
            var minl = void 0;
            var op1Length = op1.getNumberValue();
            var op2Length = op2.getNumberValue();
            if (op1.isRetain() && op2.isRetain()) {
                // Simple case: retain/retain
                if (op1Length > op2Length) {
                    minl = op2Length;
                    op1 = new Retain(op1Length - op2Length);
                    op2 = operation2.ops[i2++];
                }
                else if (op1Length === op2Length) {
                    minl = op2Length;
                    op1 = operation1.ops[i1++];
                    op2 = operation2.ops[i2++];
                }
                else {
                    minl = op1Length;
                    op2 = new Retain(op2Length - op1Length);
                    op1 = operation1.ops[i1++];
                }
                operation1prime.retain(minl);
                operation2prime.retain(minl);
            }
            else if (op1.isDelete() && op2.isDelete()) {
                // Both operations delete the same string at the same position. We don't
                // need to produce any operations, we just skip over the delete ops and
                // handle the case that one operation deletes more than the other.
                if (-op1Length > -op2Length) {
                    op1 = new Delete(op1Length - op2Length);
                    op2 = operation2.ops[i2++];
                }
                else if (op1Length === op2Length) {
                    op1 = operation1.ops[i1++];
                    op2 = operation2.ops[i2++];
                }
                else {
                    op2 = new Delete(op2Length - op1Length);
                    op1 = operation1.ops[i1++];
                }
                // next two cases: delete/retain and retain/delete
            }
            else if (op1.isDelete() && op2.isRetain()) {
                if (-op1Length > op2Length) {
                    minl = op2Length;
                    op1 = new Delete(op1Length + op2Length);
                    op2 = operation2.ops[i2++];
                }
                else if (-op1Length === op2Length) {
                    minl = op2Length;
                    op1 = operation1.ops[i1++];
                    op2 = operation2.ops[i2++];
                }
                else {
                    minl = -op1Length;
                    op2 = new Retain(op2Length + op1Length);
                    op1 = operation1.ops[i1++];
                }
                operation1prime.delete(minl);
            }
            else if (op1.isRetain() && op2.isDelete()) {
                if (op1Length > -op2Length) {
                    minl = -op2Length;
                    op1 = new Retain(op1Length + op2Length);
                    op2 = operation2.ops[i2++];
                }
                else if (op1Length === -op2Length) {
                    minl = op1Length;
                    op1 = operation1.ops[i1++];
                    op2 = operation2.ops[i2++];
                }
                else {
                    minl = op1Length;
                    op2 = new Delete(op2Length + op1Length);
                    op1 = operation1.ops[i1++];
                }
                operation2prime.delete(minl);
            }
            else {
                throw new Error('Unknown operation: operations are not compatible.');
            }
        }
        return [operation1prime, operation2prime];
    };
    return TextOperation;
}());
exports.TextOperation = TextOperation;
