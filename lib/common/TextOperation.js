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
        return this.constructor.name === 'Retain';
    };
    Operation.prototype.isDelete = function () {
        return this.constructor.name === 'Delete';
    };
    Operation.prototype.isInsert = function () {
        return this.constructor.name === 'Insert';
    };
    return Operation;
}());
var Retain = /** @class */ (function (_super) {
    __extends(Retain, _super);
    function Retain(length) {
        var _this = _super.call(this) || this;
        if (length <= 0) {
            throw new Error('length must be positive');
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
        if (length >= 0) {
            throw new Error('length must be negative');
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
        else if (this.ops.length > 1 && this.ops[this.ops.length - 1].isDelete()) {
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
    return TextOperation;
}());
exports.TextOperation = TextOperation;
