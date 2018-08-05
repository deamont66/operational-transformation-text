"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RemoteClient = /** @class */ (function () {
    function RemoteClient(id, editorAdapter, name, selection) {
        if (name === void 0) { name = ''; }
        if (selection === void 0) { selection = null; }
        this.lastSelection = null;
        this.selectionEditorHandler = null;
        this.id = id;
        this.editorAdapter = editorAdapter;
        this.name = name;
        if (selection) {
            this.updateSelection(selection);
        }
    }
    RemoteClient.prototype.setName = function (name) {
        if (this.name !== name) {
            this.name = name;
            if (this.lastSelection) {
                this.updateSelection(this.lastSelection);
            }
        }
    };
    RemoteClient.prototype.updateSelection = function (selection) {
        this.removeSelection();
        this.selectionEditorHandler = this.editorAdapter.setOtherSelection(this, selection);
        this.lastSelection = selection;
    };
    /**
     * Removes client selection.
     *
     * Optionally reimplement this method to remove selection after client disconnected (ie. remove client selection marker from editor).
     */
    RemoteClient.prototype.removeSelection = function () {
        if (this.selectionEditorHandler && this.selectionEditorHandler.clear) {
            this.selectionEditorHandler.clear();
        }
        this.lastSelection = null;
        this.selectionEditorHandler = null;
    };
    /**
     * Clean up after client (internally calls @method removeSelection).
     *
     * Optionally reimplement this method to clean up after client disconnected.
     */
    RemoteClient.prototype.remove = function () {
        this.removeSelection();
    };
    return RemoteClient;
}());
exports.RemoteClient = RemoteClient;
