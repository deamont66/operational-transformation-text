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
        if (a instanceof SimpleNoop || b instanceof SimpleNoop) {
            return [a, b];
        }
        if (a instanceof SimpleInsert && b instanceof SimpleInsert) {
            return SimpleOperation.transformInserts(a, b);
        }
        if (a instanceof SimpleInsert && b instanceof SimpleDelete) {
            return SimpleOperation.transformInsertaAndDelete(a, b);
        }
        if (a instanceof SimpleDelete && b instanceof SimpleInsert) {
            return SimpleOperation.transformDeleteAndInsert(a, b);
        }
        if (a instanceof SimpleDelete && b instanceof SimpleDelete) {
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
            return [a, new SimpleInsert(b.str, b.position + a.str.length)];
        }
        else if (a.position > b.position || (a.position === b.position && a.str > b.str)) {
            return [new SimpleInsert(a.str, a.position + b.str.length), b];
        }
        else {
            return [new SimpleNoop(), new SimpleNoop()];
        }
    };
    SimpleOperation.transformInsertaAndDelete = function (a, b) {
        if (a.position <= b.position) {
            return [a, new SimpleDelete(b.count, b.position + a.str.length)];
        }
        else if (a.position >= b.position + b.count) {
            return [new SimpleInsert(a.str, a.position - b.count), b];
        }
        // Here, we have to delete the inserted string of operation a.
        // That doesn't preserve the intention of operation a, but it's the only
        // thing we can do to get a valid transform function.
        return [new SimpleNoop(), new SimpleDelete(b.count + a.str.length, b.position)];
    };
    SimpleOperation.transformDeleteAndInsert = function (a, b) {
        var _a = SimpleOperation.transformInsertaAndDelete(b, a), resB = _a[0], resA = _a[1];
        return [resA, resB];
    };
    SimpleOperation.transformDeletes = function (a, b) {
        if (a.position === b.position) {
            if (a.count === b.count) {
                return [new SimpleNoop(), new SimpleNoop()];
            }
            else if (a.count < b.count) {
                return [new SimpleNoop(), new SimpleDelete(b.count - a.count, b.position)];
            }
            return [new SimpleDelete(a.count - b.count, a.position), new SimpleNoop()];
        }
        else if (a.position < b.position) {
            if (a.position + a.count <= b.position) {
                return [a, new SimpleDelete(b.count, b.position - a.count)];
            }
            else if (a.position + a.count >= b.position + b.count) {
                return [new SimpleDelete(a.count - b.count, a.position), new SimpleNoop()];
            }
            return [
                new SimpleDelete(b.position - a.position, a.position),
                new SimpleDelete(b.position + b.count - (a.position + a.count), a.position)
            ];
        }
        else {
            // if (a.position > b.position)
            if (a.position >= b.position + b.count) {
                return [new SimpleDelete(a.count, a.position - b.count), b];
            }
            else if (a.position + a.count <= b.position + b.count) {
                return [new SimpleNoop(), new SimpleDelete(b.count - a.count, b.position)];
            }
            return [
                new SimpleDelete(a.position + a.count - (b.position + b.count), b.position),
                new SimpleDelete(a.position - b.position, b.position)
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
                simpleOperations.push(new SimpleInsert(op.getStringValue(), index));
                index += op.getStringValue().length;
            }
            else {
                // if (op.isDelete())
                simpleOperations.push(new SimpleDelete(Math.abs(op.getNumberValue()), index));
            }
        }
        return simpleOperations;
    };
    return SimpleOperation;
}());
exports.SimpleOperation = SimpleOperation;
var SimpleNoop = /** @class */ (function (_super) {
    __extends(SimpleNoop, _super);
    function SimpleNoop() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SimpleNoop.prototype.apply = function (document) {
        return document;
    };
    SimpleNoop.prototype.toString = function () {
        return 'Noop()';
    };
    SimpleNoop.prototype.toJson = function () {
        return 0;
    };
    SimpleNoop.prototype.equals = function (other) {
        return other instanceof SimpleNoop;
    };
    return SimpleNoop;
}(SimpleOperation));
exports.SimpleNoop = SimpleNoop;
var SimpleDelete = /** @class */ (function (_super) {
    __extends(SimpleDelete, _super);
    function SimpleDelete(count, position) {
        var _this = _super.call(this) || this;
        if (count <= 0)
            throw new Error('count must be greather then 0');
        if (position < 0)
            throw new Error('position must be greather then or equal 0');
        _this.count = count;
        _this.position = position;
        return _this;
    }
    SimpleDelete.prototype.apply = function (document) {
        return document.slice(0, this.position) + document.slice(this.position + this.count);
    };
    SimpleDelete.prototype.toString = function () {
        return 'Delete(' + this.count + ', ' + this.position + ')';
    };
    SimpleDelete.prototype.toJson = function () {
        return -this.count;
    };
    SimpleDelete.prototype.equals = function (other) {
        return (other instanceof SimpleDelete &&
            other.count === this.count &&
            other.position === this.position);
    };
    return SimpleDelete;
}(SimpleOperation));
exports.SimpleDelete = SimpleDelete;
var SimpleInsert = /** @class */ (function (_super) {
    __extends(SimpleInsert, _super);
    function SimpleInsert(str, position) {
        var _this = _super.call(this) || this;
        if (str.length <= 0)
            throw new Error('str length must be greather then 0');
        if (position < 0)
            throw new Error('position must be greather then or equal 0');
        _this.str = str;
        _this.position = position;
        return _this;
    }
    SimpleInsert.prototype.apply = function (document) {
        return document.slice(0, this.position) + this.str + document.slice(this.position);
    };
    SimpleInsert.prototype.toString = function () {
        return 'Insert(' + this.str + ', ' + this.position + ')';
    };
    SimpleInsert.prototype.toJson = function () {
        return this.str;
    };
    SimpleInsert.prototype.equals = function (other) {
        return (other instanceof SimpleInsert &&
            other.str === this.str &&
            other.position === this.position);
    };
    return SimpleInsert;
}(SimpleOperation));
exports.SimpleInsert = SimpleInsert;
