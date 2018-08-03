"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TextOperation_1 = require("./TextOperation");
var WrappedOperation = /** @class */ (function () {
    /**
     * Creates instance of WrappedOperation around TextOperation and Selection.
     * @param {TextOperation} operation
     * @param {Selection} selection
     * @memberof WrappedOperation
     */
    function WrappedOperation(operation, selection) {
        this.operation = operation;
        this.selection = selection;
    }
    /**
     * Calls apply function of wrapped TextOperation
     */
    WrappedOperation.prototype.apply = function (str) {
        return this.operation.apply(str);
    };
    /**
     * Returns inverted WrappedOperation of inverted wrapped TextOperation and same Selection.
     *
     * @returns {WrappedOperation} inverted WrappedOperation
     */
    WrappedOperation.prototype.invert = function (str) {
        return new WrappedOperation(this.operation.invert(str), this.selection);
    };
    /**
     * Returns new composed WrappedOperation.
     *
     * @param {WrappedOperation} other
     * @returns {WrappedOperation}
     */
    WrappedOperation.prototype.compose = function (other) {
        return new WrappedOperation(this.operation.compose(other.operation), this.selection.compose(other.selection));
    };
    /**
     * @see {TextOperation.transform}
     * @param {WrappedOperation} a
     * @param {WrappedOperation} b
     * @returns {[WrappedOperation, WrappedOperation]}
     */
    WrappedOperation.transform = function (a, b) {
        var pair = TextOperation_1.TextOperation.transform(a.operation, b.operation);
        return [
            new WrappedOperation(pair[0], a.selection.transform(b.operation)),
            new WrappedOperation(pair[1], b.selection.transform(a.operation))
        ];
    };
    return WrappedOperation;
}());
exports.WrappedOperation = WrappedOperation;
