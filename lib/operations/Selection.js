"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Range = /** @class */ (function () {
    function Range(anchor, head) {
        this.anchor = anchor;
        this.head = head;
    }
    Range.fromJSON = function (obj) {
        return new Range(obj.anchor, obj.head);
    };
    Range.prototype.equals = function (other) {
        return this.anchor === other.anchor && this.head === other.head;
    };
    Range.prototype.isEmpty = function () {
        return this.anchor === this.head;
    };
    Range.prototype.transform = function (operation) {
        var newAnchor = Range.transformIndex(operation, this.anchor);
        if (this.anchor === this.head) {
            return new Range(newAnchor, newAnchor);
        }
        return new Range(newAnchor, Range.transformIndex(operation, this.head));
    };
    Range.transformIndex = function (other, index) {
        var newIndex = index;
        var ops = other.ops;
        for (var i = 0, l = other.ops.length; i < l; i++) {
            if (ops[i].isRetain()) {
                index -= ops[i].getNumberValue();
            }
            else if (ops[i].isInsert()) {
                newIndex += ops[i].getStringValue().length;
            }
            else {
                //  if (ops[i].isDelete()
                newIndex -= Math.min(index, -ops[i].getNumberValue());
                index += ops[i].getNumberValue();
            }
            if (index < 0) {
                break;
            }
        }
        return newIndex;
    };
    return Range;
}());
exports.Range = Range;
var Selection = /** @class */ (function () {
    function Selection(ranges) {
        if (ranges === void 0) { ranges = []; }
        this.ranges = ranges;
    }
    Selection.createCursor = function (position) {
        return new Selection([new Range(position, position)]);
    };
    Selection.fromJSON = function (obj) {
        var objRanges = obj.ranges;
        var ranges = [];
        for (var i = 0; i < objRanges.length; i++) {
            ranges[i] = Range.fromJSON(objRanges[i]);
        }
        return new Selection(ranges);
    };
    Selection.prototype.equals = function (other) {
        if (this.ranges.length !== other.ranges.length) {
            return false;
        }
        var sortedA = this.ranges.slice(0).sort(function (a, b) { return a.anchor - b.anchor || a.head - b.head; });
        var sortedB = other.ranges
            .slice(0)
            .sort(function (a, b) { return a.anchor - b.anchor || a.head - b.head; });
        for (var i = 0; i < sortedA.length; i++) {
            if (!sortedA[i].equals(sortedB[i])) {
                return false;
            }
        }
        return true;
    };
    Selection.prototype.somethingSelected = function () {
        for (var i = 0; i < this.ranges.length; i++) {
            if (!this.ranges[i].isEmpty()) {
                return true;
            }
        }
        return false;
    };
    // Return the more current selection information.
    Selection.prototype.compose = function (other) {
        return other;
    };
    // Update the selection with respect to an operation.
    Selection.prototype.transform = function (other) {
        var newRanges = [];
        for (var i = 0; i < this.ranges.length; i++) {
            newRanges[i] = this.ranges[i].transform(other);
        }
        return new Selection(newRanges);
    };
    return Selection;
}());
exports.Selection = Selection;
