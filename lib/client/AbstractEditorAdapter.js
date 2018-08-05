"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Signal_1 = require("../utils/Signal");
var SimpleTypedEvent_1 = require("../utils/SimpleTypedEvent");
/**
 * AbstractEditorAdapter for EditorClient
 *
 * @export
 * @abstract
 * @class AbstractEditorAdapter
 * @template TId remote client identificator type
 */
var AbstractEditorAdapter = /** @class */ (function () {
    function AbstractEditorAdapter() {
        /**
         * performed undo
         *
         * @memberof AbstractEditorAdapter
         */
        this.undo = new Signal_1.Signal();
        /**
         * performed redo
         *
         * @memberof AbstractEditorAdapter
         */
        this.redo = new Signal_1.Signal();
        /**
         * editor blur occurred
         *
         * @memberof AbstractEditorAdapter
         */
        this.blur = new Signal_1.Signal();
        /**
         * on editor selection change
         *
         * @memberof AbstractEditorAdapter
         */
        this.selectionChange = new Signal_1.Signal();
        /**
         * <{operation, selection}> - on editor value (and most likely selection) change
         *
         * @memberof AbstractEditorAdapter
         */
        this.change = new SimpleTypedEvent_1.SimpleTypedEvent();
    }
    return AbstractEditorAdapter;
}());
exports.AbstractEditorAdapter = AbstractEditorAdapter;
