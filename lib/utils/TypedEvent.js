"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Passes through events as they happen. You will not get events from before you start listening
 *
 * @export
 * @class TypedEvent
 * @template TSender
 * @template TEvent
 */
var TypedEvent = /** @class */ (function () {
    function TypedEvent() {
        var _this = this;
        this.listeners = [];
        this.listenersOncer = [];
        this.on = function (listener) {
            _this.listeners.push(listener);
            return {
                dispose: function () { return _this.off(listener); }
            };
        };
        this.once = function (listener) {
            _this.listenersOncer.push(listener);
        };
        this.off = function (listener) {
            var callbackIndex = _this.listeners.indexOf(listener);
            if (callbackIndex > -1)
                _this.listeners.splice(callbackIndex, 1);
        };
        this.emit = function (sender, event) {
            /** Update any general listeners */
            _this.listeners.forEach(function (listener) { return listener(sender, event); });
            /** Clear the `once` queue */
            _this.listenersOncer.forEach(function (listener) { return listener(sender, event); });
            _this.listenersOncer = [];
        };
        this.pipe = function (te) {
            return _this.on(function (s, e) { return te.emit(s, e); });
        };
    }
    return TypedEvent;
}());
exports.TypedEvent = TypedEvent;
