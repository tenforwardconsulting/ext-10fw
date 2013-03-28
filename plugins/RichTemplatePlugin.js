/* 
 * It is often desirable to render Ext Components into an html or tpl-based component. 
 * This mixin should be used on the parent component that uses a template and it will automatically clean up components
 * you should implmeent "renderRichTemplate" which will automatically get called on render (and update) 
 * 
 */

Ext.define("TenForward.plugins.RichTemplatePlugin", {
    alias: 'plugin.rich-template',
    init: function(component) {
        this.component = component;
        this.richComponents = [];
        if(typeof(component.renderRichTemplate) === 'function') {
            component.on('render', this.renderRichComponents, this);
            component.on('update', this.updateRichComponents, this);
        }
    },
    renderRichComponents: function(component, options) {
        Ext.ComponentManager.all.on('add', this.onRegisterComponent, this);
        try {
            this.component.renderRichTemplate.call(this.component, this.component, options);
        } catch (exception) {
            this.component.un('update', this.updateRichComponents, this);
            this.component.update("<h1>Oops!</h1><br><h2>There was an error displaying this content.  Please try again later.</h2>");
            console.log("Exception in renderRichComponents of " + this.component.xtype);
            emn8.Util.logException(exception);
        }
        Ext.ComponentManager.all.un('add', this.onRegisterComponent, this);
    },
    onRegisterComponent: function(hashmap, id, component) {
        if (component.ownerCt && this.richComponents.indexOf(component.ownerCt) > -1) {
            this.richComponents.push(component);
        }
    },
    updateRichComponents: function() {
        this.destroyRichComponents();
        this.renderRichComponents(this.component, {});
    },
    destroyRichComponents: function() {
        Ext.each(this.richComponents, function(comp) {
           comp.destroy();
        });
        this.richComponents = [];
    },
    destroy: function() {
        this.destroyRichComponents();
    }
});
