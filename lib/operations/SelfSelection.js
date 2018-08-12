"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SelfSelection = /** @class */ (function () {
    function SelfSelection(selectionBefore, selectionAfter) {
        this.selectionBefore = selectionBefore;
        this.selectionAfter = selectionAfter;
    }
    SelfSelection.prototype.invert = function () {
        return new SelfSelection(this.selectionAfter, this.selectionBefore);
    };
    SelfSelection.prototype.compose = function (other) {
        return new SelfSelection(this.selectionBefore, other.selectionAfter);
    };
    SelfSelection.prototype.transform = function (operation) {
        return new SelfSelection(this.selectionBefore.transform(operation), this.selectionAfter.transform(operation));
    };
    return SelfSelection;
}());
exports.SelfSelection = SelfSelection;
