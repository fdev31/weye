"use strict";

var Templates = {};

function TemplateFactory(item) {
    var t = MimeManager.get_template(item.mime);
    var i = new t(item);
    return i;
}

// -- TEMPLATE obj

function PageTemplate(data, name) {
    if (!!! name)
        name = 'file';
    this.data = data;
    this.name = 'view_'+name;
}
PageTemplate.prototype.from = function (resource) {
//    console.log('creating template...');
    return ich[this.name](resource || this.data);
};
PageTemplate.prototype.draw = function(resource) {
    $('#contents').html(this.from(resource));
//    console.log('html content set');
};
PageTemplate.prototype.clear = function() {
    $('#contents').html('');
};

// item list

function ItemList(data, item_template) {
    PageTemplate.call(this, data);
    this.selected = -1;
    this.item_template = 'view_'+ (item_template || UI.item_template);
    this.data.item_template = this._item_templater;
//    this.data.children = data;
    this._c = data.children || []; // convenient alias
    var _r = {}
    this._index = _r;
    for (var i=0; i<this._c.length; i++) {
        this._c[i]._parent = this;
        _r[ this._c[i].link ] = i;
    }
}
inherits(ItemList, PageTemplate);

// TODO: replace by factory
Templates['folder'] = ItemList;

ItemList.prototype.get_dom = function(link) {
    return $('.items .item[data-link="'+link+'"]');
};
ItemList.prototype.find_by_link = function(link) {
    return this._c[this._index[link]];
};
ItemList.prototype.refresh_by_link = function(link, metadata) {
    var item = this._c[this._index[link]];
    $.extend(item, metadata);
    var e = this.get_dom(item.link).html(
            ich[this.item_template](item).children().html()
        );
    this.setup_links(e);
};
// TODO: keyboard nav
ItemList.prototype.select = function(index) {
    self.selected += index;
};
ItemList.prototype.insert = function(resource) {
//    console.log('insert', resource, 'into', this);
    var d = ich[this.item_template](resource).children();
    this._index[resource.link] = d;
    this._c.push(d);
    $('.items').isotope('insert', d);
};
ItemList.prototype.remove = function(resource) {
    var e = this.get_dom(resource.link);
    e.fadeOut( function() {
        e.remove();
        $('.items').isotope('reLayout');
    });
};
ItemList.prototype.sort_by = function(dom_elt, criteria) {
    UI.fix_nav(dom_elt);
    $('.items').isotope({ sortBy : criteria });
};
ItemList.prototype._item_templater = function(data) {
    // called in Item context
    return ich[this._parent.item_template](this).html();
};
ItemList.prototype.draw = function() {
//    console.log('ItemList.draw');
    PageTemplate.prototype.draw.call(this);
    $('.items').isotope({itemSelector: '.item',  layoutMode : 'fitRows', sortBy: 'type',
        animationEngine: 'css', transformsEnabled: 'false',
        getSortData : {
            title: function ( e ) {
                return e.data('title');
            },
            type: function ( e ) {
                var m = e.data('mime');
                if (m==='folder') {
                    return '!!!!!!!'+e.data('title').toLocaleLowerCase();
                }
                return e.data('mime') + '!' + e.data('title').toLocaleLowerCase();
            }
        }
    });
    if(this._c.length === 0)
        $.pnotify({type: 'info', title: 'Attention', text: 'No item in this folder.', delay: 1000});
 
    this.setup_links( $('.items') );
};
ItemList.prototype.setup_links = function(jqelt) {

    jqelt.find('.item_touch').hammer()
        .bind({
            tap: UI.execute_item_handler
            //            hold: ItemTool.popup_evt_handler,
            //            swipe: ItemTool.popup_evt_handler
        });
};


