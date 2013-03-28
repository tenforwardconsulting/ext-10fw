/**
 * This combo should be much better behaved than a regular combo.  It is
 * basically a html select, except it can be dynamically loaded via ajax.  Users
 * cannot type free text into it(unless you say "autoComplete: true"), 
 * but its values can come from all over.
 * Originally written at SixFriedRice.
 *
 *
 * config options:
 *    name: the field name
 *    store: array/store
 *    valueField:
 *    value: the selected value.  If you
 *    defaultFirst: true to automatically choose the first value, requires autoLoad
 *    autoComplete: true to allow typing in the field and remote filtering.
 */
Ext.define('TenForward.form.WellBehavedComboBox', {
   extend: 'Ext.form.ComboBox',
   alias: 'widget.wellbehavedcombo',
   initComponent: function() {
      this.initial_value = this.value;
      this.initial_disabled = this.disabled;
      this.type_ahead_buffer = "";
      this.reset_timeout = null;

      if (!this.autoComplete) {
        this.editable = false;
        this.triggerAction = "all";
      }
      this.queryMode = this.queryMode || 'local'; //remote is only needed for type ahead
      this.enableKeyEvents = true;

      this.callParent();

      if (this.store instanceof Ext.data.JsonStore) {
         this.store.on('load', this.on_store_load, this);
      }

      this.on('keypress', this.on_keypress, this);
      this.on('focus', this.on_focus, this, {delay: 150});
      this.on('blur', this.on_blur, this);

      this.addEvents({'load': true});
   },

   on_focus: function () {
      if (this.editable) {
        this.inputEl.dom.select();
      } else if (!this.isExpanded) {
        //popup the list when somebody tabs onto the combo
         this.onTriggerClick();
      }
   },

   on_blur: function () {
      this.sfr_selected_via_keyboard = false;
   },

   on_store_load: function() {
      if (this.initial_value !== undefined) {
         this.setValue(this.initial_value);
         this.initial_value = undefined;
      }
      else if(this.defaultFirst){
         this.setValue(this.getStore().data.items[0].data.id);
      }

      if (!this.initial_disabled) {
         this.enable();
      }
      this.fireEvent('load', this, this.get_selected_record());
   },

   get_selected_record: function(){
      var rec = null;
      var index = this.store.findBy(function(rec, id) {
         return (rec.data[this.displayField] === this.getRawValue());
      }, this);
      if(index !== -1) {
         rec = this.store.getAt(index);
      }
      return rec;
   },

   initEvents : function(){
        Ext.form.ComboBox.superclass.initEvents.call(this);

        this.queryDelay = Math.max(this.queryDelay || 10,
                this.mode === 'local' ? 10 : 250);
        this.dqTask = new Ext.util.DelayedTask(this.initQuery, this);
        if(this.typeAhead){
            this.taTask = new Ext.util.DelayedTask(this.onTypeAhead, this);
        }
        if(!this.enableKeyEvents){
            this.mon(this.el, 'keyup', this.onKeyUp, this);
        }
    },

   on_keypress: function(field, e) {
      this.type_ahead_buffer += String.fromCharCode(e.getCharCode()).toLowerCase();
      if (this.reset_timeout) {
         clearTimeout(this.reset_timeout);
      }
      this.reset_timeout = setTimeout(Ext.bind(this.reset_type_ahead, this), 500);

      this.store.each(function(rec) {
         var display_name = "";
         if (this.displayField) {
            display_name = rec.data[this.displayField];
         } else {
            display_name = rec.data[1];
         }

         display_name = display_name.toString().toLowerCase();
         if (display_name.substr(0, this.type_ahead_buffer.length) === this.type_ahead_buffer) {
            //this is the first record that starts with ch
            var boundList = this.getPicker();
            boundList.highlightItem(boundList.getNode(rec));
            if (Ext.get(boundList.getNode(rec))) {
                Ext.get(boundList.getNode(rec)).scrollIntoView(Ext.get(boundList.getNode(rec)).up('div'));
            }

            return false;
         }
      }, this);
   },

   reset_type_ahead: function() {
      this.type_ahead_buffer = "";
      this.reset_timeout = null;
   }
});