"use strict";

function ResourceFactory(item) {
    var found = false;
    var choices = MimeManager.find_choices(item.mime);
    for (var n=0; (!!! found) && n < choices.length ; n++) {
        try {
            found = Nano.mimes[ choices[n] ];
        } catch(err) {
            found = false;
        }
        if (found) break;
    }
    if(!!!found) {
        $.pnotify({'type': 'error', 'title': 'Type association', 'text': 'failed loading one of: '+choices});
    }
    return new found(item);
}

/*
 * Resources and Items
 * ###################
 *
 *
 * .. class:: Resource(dict)
 *
 *      The most basic object you can work on
 *
 *      :arg dict: the Object containing initial metadata for this Resource
 *
 */
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
    if (!!!this.editables)
        this.editables = 'title mime descr';
};
/*
 *     .. data:: Resource.type = 'resource'
 *
 *          More or less the lowercased name corresponding to this class name
 */
Resource.prototype.type = 'resource';

/*
 *     .. data:: Resource.is_data = true
 *
 *          set to false if this is some kind of folder
 */
Resource.prototype.is_data = true;

/*
 *     .. data:: Resource.searchable = 'title'
 *
 *          Space-separated list of properties available for filtering, see :func:`UI.filter_items`
 */
Resource.prototype.searchable = 'title';
/*
 *     .. data:: Resource.dependencies = []
 *
 *          List of file names to load prior loading this item
 */
Resource.prototype.dependencies = [];
/*
 *     .. data:: Resource.stylesheet = false
 *
 *          Tells if a style.css file should be loaded for this kind of :class:`Item`
 */
Resource.prototype.stylesheet = false;
/*
 *     .. function:: Resource.hg_size
 *
 *          Returns a human readable size for this :class:`Item`, see :func:`UI.hr_size` .
 */
Resource.prototype.hr_size = function() {
    return UI.hr_size(this.size);
};
/*
 *     .. function:: Resource.getItem
 *
 *          Returns a fresh item from this one, by requesting data to server.
 */
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
/*
 *     .. function:: Resource.post_view_callback
 *
 *          Called when this item has been loaded. You may add your custom DOM processing here
 */
Resource.prototype.post_view_callback = function() {
    if (!!!this.is_data) {
        $('.folder-item').fadeIn(function() {$('.folder-item').removeClass('hidden');});
        $('.pure-item').fadeOut(function() {$('.pure-item').addClass('hidden');});
    } else {
        $('.folder-item').fadeOut(function(){$('.folder-item').addClass('hidden');});
        $('.pure-item').fadeIn(function() {$('.pure-item').removeClass('hidden');});
        $('#main_header .big_icon').addClass('faded_in');
    }
};
/*
 *     .. function:: Resource.edit
 *
 *          Edit this item, if the :data:`Resource.link`
 *          TODO: refactor it
 */
Resource.prototype.edit = function() {
    if(this.link.startswith('js:')) {
        UI.edit_item(this);
    } else {
        this.getItem( function(item) {
            UI.edit_item(item);
        });
    }
};
/*
 *     .. function:: Resource.del
 *
 *          Deletes an item (from server)
 */
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
/*
 *     .. function:: Resource.view
 *
 *          Displays an item, calling :func:`Nano.load_resource`
 */
Resource.prototype.view = function() {
//    console.log('Resource view > nano load_resource', this);
    $('#contents').addClass('slided_left');
    Nano.load_resource( this );
};
Resource.prototype.save = function() {
};
/*
 *     .. function:: Resource.get_ref
 *
 *          Returns resource's path (HTML view)
 */
Resource.prototype.get_ref = function() {
    if (!!! this.cont || !!! this.link)
        return '/';
    return this.cont + this.link;
};
/*
 *     .. function:: Resource.get_raw_ref
 *
 *          Returns resource's path for RAW data
 */
Resource.prototype.get_raw_ref = function() {
    return '/d' + this.get_ref();
};
/*
 *     .. function:: Resource.get_obj_ref
 *
 *          Returns resource's path for JSON metadata
 */
Resource.prototype.get_obj_ref = function() {
    return '/o' + this.get_ref();
};
/*
 *     .. function:: Resource.get_obj_ref
 *
 *          Returns resource's path for JSON child resources list
 */
Resource.prototype.get_child_ref = function() {
    return '/c' + this.get_ref();
};

// -- ITEM class

/*
 * .. class:: Item(dict)
 *
 *      *Inherits* :class:`Resource`
 *
 *      Just adds title from link in case it's empty and sets a default description
 */

function Item (dict) {
    Resource.call(this, dict);
    if (!!! this.title)
        this.title = this.link;
    if (!!! this.descr)
        this.descr = 'No description';
};
// Inherits `Resource`
inherits(Item, Resource);
Item.prototype.type = 'item';

