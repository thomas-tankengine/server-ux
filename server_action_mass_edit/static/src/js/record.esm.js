import {Record} from "@web/model/relational_model/record";
import {patch} from "@web/core/utils/patch";

patch(Record.prototype, {
    // Odoo 20 core (relational_model/record.js) added a 3rd "{ orderBys }" param
    // and dropped "currentCompanyId" from the config. We keep the OCA fix below
    // (guard against a non-array "data" while set/remove/add-ing a value in the
    // wizard, where it is a plain array of {id} objects rather than a fetched
    // record list): without it, "data.map is not a function" is raised.
    _createStaticListDatapoint(data, fieldName, {orderBys} = {}) {
        const {related, limit, defaultOrderBy} = this.activeFields[fieldName];
        const relatedActiveFields = (related && related.activeFields) || {};
        const config = {
            resModel: this.fields[fieldName].relation,
            activeFields: relatedActiveFields,
            fields: (related && related.fields) || {},
            relationField: this.fields[fieldName].relation_field || false,
            offset: 0,
            // To prevent the TypeError: data.map is not a function while set/remove/add
            // value in wizard
            resIds: Array.isArray(data) ? data.map((r) => r.id || null) : [],
            orderBy: orderBys?.[fieldName] || defaultOrderBy || [],
            limit:
                limit ||
                (Object.keys(relatedActiveFields).length ? Number.MAX_SAFE_INTEGER : 1),
            context: {},
        };
        const options = {
            onUpdate: ({withoutOnchange} = {}) =>
                this._update({[fieldName]: []}, {withoutOnchange}),
            parent: this,
        };
        return new this.model.constructor.StaticList(this.model, config, data, options);
    },
});
