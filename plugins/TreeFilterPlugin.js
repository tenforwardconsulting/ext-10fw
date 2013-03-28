// Add local filtering support for a tree store
Ext.define("TenForward.plugins.TreeFilterPlugin", {
    alias: 'plugin.tree-filter',
    init: function(tree) {
        this.tree = tree;
        this.tree.getStore().on('filterchange', this.onFilterChange, this);
    },
    onFilterChange: function() {
        if (!this.tree.getStore().hasFilter) {
            this.tree.el.select(".x-grid-row").removeCls('x-hide-display');
        }
        var elements = [];
        var store = this.tree.getStore();
        Ext.Array.each(store.filters.items, function(filter) {
            Ext.Object.each(store.tree.nodeHash, function(key, node) {
                if (node.childNodes && node.childNodes.length > 0) { return true; }
                if (filter.filterFn) {
                    if (!filter.filterFn(node)) {
                        elements.push(this.tree.getView().getNode(node));
                    }
                } else if (node.data[filter.property] != filter.value ) {
                    elements.push(this.tree.getView().getNode(node));
                }
            }, this);
        }, this);
        new Ext.dom.CompositeElement(elements).addCls('x-hide-display');
    }
});


//
// Need this override for the store
//
Ext.override(Ext.data.TreeStore, {
    hasFilter: false,
    filter: function(filters, value) {
        if (Ext.isString(filters)) {
            filters = {
                property: filters,
                value: value
            };
        }
        var me = this,
            decoded = me.decodeFilters(filters),
            i = 0,
            length = decoded.length;

        for (; i < length; i++) {
            me.filters.replace(decoded[i]);
        }

        this.hasFilter = true;

        this.fireEvent('filterchange', this);
    },
    clearFilter: function() {
        var me = this;
        me.filters.clear();
        me.hasFilter = false;
        this.fireEvent('filterchange', this);
    },
    isFiltered: function() {
        return this.hasFilter;
    }
});