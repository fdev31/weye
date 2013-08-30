"use strict";

function ResourceFactory(item) {
//    console.log('Resource factory for:', item);
    if(item.size !== undefined) {
        return new Item(item);
    } else {
        return new Resource(item);
    }
}
function Resource (dict) {
    $.extend(this, dict);
    if (!!! dict.link) {
//        console.log('No link for ',dict);
    } else {
        if (!!! this.cont) {
            if( !! this.link.match(RegExp('/'))) {
                var c = this.link.split(RegExp('(.*)/(.*)'));
                this.cont = c[1];
                this.link = c[2];
            } else {
                this.cont = Nano.doc_ref;
            }
        }
    }
    if (this.cont != undefined && this.cont.substr(-1) !== '/')
        this.cont += '/';
    if (this.mime !== 'folder')
        this.is_data = true;
    if (!!!this.editables)
        this.editables = 'title mime descr';
    this.type = 'resource';
};
Resource.prototype.searchable = 'title';
Resource.prototype.hr_size = function() {
    return UI.hr_size(this.size);
};
Resource.prototype.getItem = function(callback, opts) {
    var opts = opts || {};
    $.get(this.get_obj_ref())
    .success(function(d) {
            if (d.error) {
                $.pnotify({
                    title: 'Error displaying "'+d.link+'" content',
                    text: d.message
                });
//                Nano._go_ready();
            } else {
                callback(ResourceFactory(d), opts);
//                Nano._go_ready();
            }
        })
    .error(function() {
        $.pnotify({ title: 'Error loading "'+path+'"', text: "Server not responding."});
        go_ready();
    });

};
Resource.prototype.post_view_callback = function() {
    if (this.mime === 'folder') {
        $('.folder-item').fadeIn(function() {$('.folder-item').removeClass('hidden');});
        $('.pure-item').fadeOut(function() {$('.pure-item').addClass('hidden');});
    } else {
        $('.folder-item').fadeOut(function(){$('.folder-item').addClass('hidden');});
        $('.pure-item').fadeIn(function() {$('.pure-item').removeClass('hidden');});
        $('#main_header .big_icon').addClass('faded_in');
    }
};
Resource.prototype.edit = function() {
    if(this.link.startswith('js:')) {
        UI.edit_item(this);
    } else {
        this.getItem( function(item) {
            UI.edit_item(item);
        });
    }
};
Resource.prototype.del = function() {
    var src_link = this.link;
    $.ajax(this.get_obj_ref(), {type: 'DELETE'})
        .done(function(d) {
            if (d.error) {
                $.pnotify({type: 'error', title: "Can't remove "+src_link, text: d.error});
            } else {
                Nano.content.remove({link:src_link});
            }
        });

};
Resource.prototype.view = function() {
//    console.log('Resource view > nano load_resource');
    $('#contents').addClass('slided_left');
    Nano.load_resource( this );
};
Resource.prototype.save = function() {
};
Resource.prototype.get_ref = function() {
    if (!!! this.cont || !!! this.link)
        return '/';
    return this.cont + this.link;
};
Resource.prototype.get_raw_ref = function() {
    return '/d' + this.get_ref();
};
Resource.prototype.get_obj_ref = function() {
    return '/o' + this.get_ref();
};
Resource.prototype.get_child_ref = function() {
    return '/c' + this.get_ref();
};

// -- ITEM class

function Item (dict) {
    Resource.call(this, dict);
    if (!!! this.title)
        this.title = this.link;
    if (!!! this.descr)
        this.descr = 'No description';
    this.type = 'item';
};
// Inherits `Resource`
inherits(Item, Resource);
