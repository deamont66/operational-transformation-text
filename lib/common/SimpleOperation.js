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
var SimpleOperation = /** @class */ (function () {
    function SimpleOperation() {
    }
    /**
     * Transform takes two operations A and B that happened concurrently
     * and produces two operations A' and B' (in an array)
     * such that `apply(apply(S, A), B') = apply(apply(S, B), A')`.
     * This function is the heart of OT.
     *
     * @static
     * @param {SimpleOperation} a
     * @param {SimpleOperation} b
     * @returns {[SimpleOperation, SimpleOperation]} [a', b']
     * @memberof SimpleOperation
     */
    SimpleOperation.transform = function (a, b) {
        if (a instanceof Noop || b instanceof Noop) {
            return [a, b];
        }
        if (a instanceof Insert && b instanceof Insert) {
            return SimpleOperation.transformInserts(a, b);
        }
        if (a instanceof Insert && b instanceof Delete) {
            return SimpleOperation.transformInsertaAndDelete(a, b);
        }
        if (a instanceof Delete && b instanceof Insert) {
            return SimpleOperation.transformDeleteAndInsert(a, b);
        }
        if (a instanceof Delete && b instanceof Delete) {
            return SimpleOperation.transformDeletes(a, b);
        }
        throw new Error('unknown operations: ' + a.toString() + ', ' + b.toString());
    };
    /**
     * Transforms two Insert operation agains each other based on their positions in document.
     * If positions are equal we prefer first operation in alphabetical order.
     *
     * @private
     * @static
     * @param {Insert} a
     * @param {Insert} b
     * @returns {[SimpleOperation, SimpleOperation]}
     * @memberof SimpleOperation
     */
    SimpleOperation.transformInserts = function (a, b) {
        if (a.position < b.position || (a.position === b.position && a.str < b.str)) {
            return [a, new Insert(b.str, b.position + a.str.length)];
        }
        else if (a.position > b.position || (a.position === b.position && a.str > b.str)) {
            return [new Insert(a.str, a.position + b.str.length), b];
        }
        else {
            return [new Noop(), new Noop()];
        }
    };
    SimpleOperation.transformInsertaAndDelete = function (a, b) {
        if (a.position <= b.position) {
            return [a, new Delete(b.count, b.position + a.str.length)];
        }
        else if (a.position >= b.position + b.count) {
            return [new Insert(a.str, a.position - b.count), b];
        }
        // Here, we have to delete the inserted string of operation a.
        // That doesn't preserve the intention of operation a, but it's the only
        // thing we can do to get a valid transform function.
        return [new Noop(), new Delete(b.count + a.str.length, b.position)];
    };
    SimpleOperation.transformDeleteAndInsert = function (a, b) {
        var _a = SimpleOperation.transformInsertaAndDelete(b, a), resB = _a[0], resA = _a[1];
        return [resA, resB];
    };
    SimpleOperation.transformDeletes = function (a, b) {
        if (a.position === b.position) {
            if (a.count === b.count) {
                return [new Noop(), new Noop()];
            }
            else if (a.count < b.count) {
                return [new Noop(), new Delete(b.count - a.count, b.position)];
            }
            return [new Delete(a.count - b.count, a.position), new Noop()];
        }
        else if (a.position < b.position) {
            if (a.position + a.count <= b.position) {
                return [a, new Delete(b.count, b.position - a.count)];
            }
            else if (a.position + a.count >= b.position + b.count) {
                return [new Delete(a.count - b.count, a.position), new Noop()];
            }
            return [
                new Delete(b.position - a.position, a.position),
                new Delete(b.position + b.count - (a.position + a.count), a.position)
            ];
        }
        else {
            // if (a.position > b.position)
            if (a.position >= b.position + b.count) {
                return [new Delete(a.count, a.position - b.count), b];
            }
            else if (a.position + a.count <= b.position + b.count) {
                return [new Noop(), new Delete(b.count - a.count, b.position)];
            }
            return [
                new Delete(a.position + a.count - (b.position + b.count), b.position),
                new Delete(a.position - b.position, b.position)
            ];
        }
    };
    /**
     * Convert a normal, composable `TextOperation`, into an array of `SimpleTextOperation`s.
     *
     * @static
     * @param {TextOperation} operation
     * @returns {SimpleOperation[]}
     * @memberof SimpleOperation
     */
    SimpleOperation.fromTextOperation = function (operation) {
        var simpleOperations = [];
        var index = 0;
        for (var i = 0; i < operation.ops.length; i++) {
            var op = operation.ops[i];
            if (op.isRetain()) {
                index += op.getNumberValue();
            }
            else if (op.isInsert()) {
                simpleOperations.push(new Insert(op.getStringValue(), index));
                index += op.getStringValue().length;
            }
            else {
                // if (op.isDelete())
                simpleOperations.push(new Delete(Math.abs(op.getNumberValue()), index));
            }
        }
        return simpleOperations;
    };
    return SimpleOperation;
}());
exports.SimpleOperation = SimpleOperation;
var Noop = /** @class */ (function (_super) {
    __extends(Noop, _super);
    function Noop() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Noop.prototype.apply = function (document) {
        return document;
    };
    Noop.prototype.toString = function () {
        return 'Noop()';
    };
    Noop.prototype.toJson = function () {
        return 0;
    };
    Noop.prototype.equals = function (other) {
        return other instanceof Noop;
    };
    return Noop;
}(SimpleOperation));
exports.Noop = Noop;
var Delete = /** @class */ (function (_super) {
    __extends(Delete, _super);
    function Delete(count, position) {
        var _this = _super.call(this) || this;
        if (count <= 0)
            throw new Error('count must be greather then 0');
        if (position < 0)
            throw new Error('position must be greather then or equal 0');
        _this.count = count;
        _this.position = position;
        return _this;
    }
    Delete.prototype.apply = function (document) {
        return document.slice(0, this.position) + document.slice(this.position + this.count);
    };
    Delete.prototype.toString = function () {
        return 'Delete(' + this.count + ', ' + this.position + ')';
    };
    Delete.prototype.toJson = function () {
        return -this.count;
    };
    Delete.prototype.equals = function (other) {
        return (other instanceof Delete &&
            other.count === this.count &&
            other.position === this.position);
    };
    return Delete;
}(SimpleOperation));
exports.Delete = Delete;
var Insert = /** @class */ (function (_super) {
    __extends(Insert, _super);
    function Insert(str, position) {
        var _this = _super.call(this) || this;
        if (str.length <= 0)
            throw new Error('str length must be greather then 0');
        if (position < 0)
            throw new Error('position must be greather then or equal 0');
        _this.str = str;
        _this.position = position;
        return _this;
    }
    Insert.prototype.apply = function (document) {
        return document.slice(0, this.position) + this.str + document.slice(this.position);
    };
    Insert.prototype.toString = function () {
        return 'Insert(' + this.str + ', ' + this.position + ')';
    };
    Insert.prototype.toJson = function () {
        return this.str;
    };
    Insert.prototype.equals = function (other) {
        return (other instanceof Insert && other.str === this.str && other.position === this.position);
    };
    return Insert;
}(SimpleOperation));
exports.Insert = Insert;
