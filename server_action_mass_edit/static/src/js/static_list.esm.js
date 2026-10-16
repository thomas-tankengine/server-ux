import {StaticList} from "@web/model/relational_model/static_list";
import {markRaw} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";

patch(StaticList.prototype, {
    // Odoo 20 core (relational_model/static_list.js) renamed the 1st param to
    // "_config" (still unused here) but is otherwise unchanged; we keep the OCA
    // fix below (guard against a non-array "data" while set/remove/add-ing a
    // value in the wizard): without it, "data.slice is not a function" is raised.
    setup(_config, data, options = {}) {
        this._parent = options.parent;
        this._onUpdate = options.onUpdate;
        this._cache = markRaw({});
        this._commands = [];
        this._initialCommands = [];
        this._savePoint = undefined;
        this._unknownRecordCommands = {};
        this._currentIds = [...this.resIds];
        this._initialCurrentIds = [...this.currentIds];
        this._needsReordering = false;
        this._tmpIncreaseLimit = 0;
        this._extendedRecords = new Set();

        this.count = this.resIds.length;
        this.handleField = Object.keys(this.activeFields).find(
            (fieldName) => this.activeFields[fieldName].isHandle
        );

        // To prevent the TypeError: data.slice is not a function" while set/remove/add
        // value in wizard
        this.records = Array.isArray(data)
            ? data
                  .slice(this.offset, this.limit)
                  .map((r) => this._createRecordDatapoint(r))
            : [];
    },
});
