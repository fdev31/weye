// -- RESOURCE class
function inherits(new_cls, base_cls) {
    new_cls.prototype = Object.create( base_cls.prototype );
    new_cls.prototype.constructor = new_cls;
}

function ResourceFactory(item) {
    if(item.link !== undefined) {
        return new Item(item);
    } else {
        return new Resource(item);
    }
}

function Resource (dict) {
    $.extend(this, dict);
    if (!!! dict.link)
        console.log('No link for ',dict);
    if (!!! this.cont)
        this.cont = Nano.doc_ref;
    this.type = 'resource';
};
Resource.prototype.getItem = function(callback, opts) {
    var opts = opts || {};
    $.get('/o'+this.get_ref())
    .success(function(d) {
            if (d.error) {
                $.pnotify({
                    title: 'Error displaying "'+d.link+'" content',
                    text: d.message
                });
//                Nano._go_ready();
            } else {
                if (!!!opts.disable_history)
                    history.pushState({'view': ''+Nano.doc_ref}, "Staring at "+Nano.doc_ref, '/#?view='+Nano.doc_ref);

                callback(ResourceFactory(d));

//                n_w.load_view(d);
//                go_ready();
            }
        })
    .error(function() {
        $.pnotify({ title: 'Error loading "'+path+'"', text: "Server not responding."});
        go_ready();
    });

};
Resource.prototype.edit = function() {
};
Resource.prototype.del = function() {
};
Resource.prototype.view = function() {
    Resource_view( this.get_ref() );
};
Resource.prototype.get_ref = function() {
    console.log(this);
    if (!!! this.cont || !!! this.link)
        return '/';
    return this.cont + '/' + this.link;
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

// -- UI object
var UI = {
    item_template: 'list_item_big',
    set_context: function(name) {
        var buttons = $('#addsearch_form');
        buttons.find('button').removeClass('hidden');
        if(name === 'folder') {
            $('.folder-item').show();
            $('.pure-item').hide();
        } else {
            $('.folder-item').hide();
            $('.pure-item').show();
            $('.filesize').each( function(i, x) {
                var o=$(x);
                if (!!! o.data('_fs_converted')) {
                    o.text(hr_size(eval(o.text())));
                }
                o.data('_fs_converted', 1);
            });
        }
    }
};

// -- TEMPLATE obj

function Template (name, data) {
    this.name = 'view_'+name;
    this.data = data;
};
Template.prototype.from = function (resource) {
    return ich[this.name](resource || this.data);
};
Template.prototype.draw = function(resource) {
    $('#contents').html(this.from(resource));
};
Template.prototype.clear = function() {
    $('#contents').html('');
};
// item list
function ItemList(data, item_template) {
    Template.call(this, 'list');
    this.selected = -1;
    this.item_template = 'view_'+ (item_template || UI.item_template);
    this.data = { item_template: this._item_templater };
    this.data.children = data;
    for (var i=0; i<data.length; i++)
        data[i]._parent = this;
}
inherits(ItemList, Template);

ItemList.prototype.select = function(index) {
    self.selected += index;
};
ItemList.prototype.insert = function(resource) {
};
ItemList.prototype.remove = function(resource) {
};
ItemList.prototype.sort_by = function(criteria) {
};
ItemList.prototype._item_templater = function(data) {
    // called in Item context
    return ich[this._parent.item_template](this).html();
};
ItemList.prototype.draw = function() {
    Template.prototype.draw.call(this);
    $('.items').isotope({itemSelector: '.item',  layoutMode : 'fitRows', sortBy: 'type',
        getSortData : {
            title: function ( e ) {
                return e.data('title');
            },
            type: function ( e ) {
                var m = e.data('mime');
                if (m==='folder') {
                    return '!!!!!!!!!!!!!!!!!!!!!'+e.data('title').toLocaleLowerCase();
                }
                return e.data('mime') + '!' + e.data('title').toLocaleLowerCase();
            }
        }
    });
};


// -- NANO obj

Nano = { doc_ref : '/' };
Nano.current = new Resource({link:'', mime:'folder', cont:''});
Nano.get_permalink = function() {
    return '/#?view=' + Nano.doc_ref;
};
Nano.get = function(link) {
};
Nano.load_link = function(link) {
    return Resource_view(link);
};
Nano.reload = function() {
    return this.display(this.current);
};
Nano._go_busy = function() {
};
Nano._go_ready = function() {
};
Nano._unload_plugins = function() {
    $('audio').each( function() {this.pause(); this.src = "";} );
};
if (!!mimes) {
    Nano.mimes = mimes;
};
Nano.set_children = function(children, item_template) {
    if( 0 === children.length) {
        $.pnotify({type: 'info', title: 'Attention', text: 'No item in this folder.', delay: 1000});
    }
    this.children = new ItemList(children);
    this.children.draw();
}
Nano.display = function(resource, opts) {
    UI.set_context(resource.mime);

    var set_content = function(resource) {
        var hdr = $('#main_header');
        hdr.replaceWith( ich.header( resource ) );
        Nano.doc_ref = resource.cont + '/' + resource.link;
        Nano.current = ResourceFactory(resource);
        load_page(Nano.current);
    }
    if (instanceOf(resource, Item)) {
        set_content(resource);
    } else {
        resource.getItem(set_content, opts);
    }

};

/*
 *
 * .. _compact_form:
 *
 * .. index:: Compact format
 *
 * .. function:: uncompress_resources(keys_values_array)
 *
 *      Uncompresses a list of "compact" |jsitem|\ s as returned by :py:func:`weye.root_objects.list_children` for instance.
 *
 *      :arg keys_values_array: tuple of *property names* and *list of values*. Ex:
 *
 *         .. code-block:: js
 *             
 *            { 'c': ['link', 'age'], 'r': [ ['toto', 1], ['tata', 4], ['titi', 42] ] }
 *
 *      :returns: "flat" array of objects. Ex:
 *
 *         .. code-block:: js
 *
 *            [ {'link': 'toto', 'age': 1}, {'name': 'tata', 'age': 4}, {'name': 'titi', 'age': 42} ]
 */

function uncompress_resources(keys_values_array) {
    var keys = keys_values_array.c;
    var list_of_values = keys_values_array.r;
    var ret = [];

    for (var i=0; i<list_of_values.length; i++) {
        var values = list_of_values[i];
        var item = {};
        for (var pid=0; pid<keys.length; pid++) {
            item[ keys[pid] ] = values[pid];
        }
        ret.push( ResourceFactory(item) );
    }
    return ret;
};
$(function() {
    // prevent default action
    $('#addsearch_form').submit(function() {return false});

    // handle upload stuff
    $('#file').bootstrapFileInput();
    var up = new uploader($('#file').get(0), {
        url:'/upload',
        extra_data_func: function(data) { return {'prefix': ui.doc_ref} },
        progress:function(ev){ $('#file_caption').text('Uploaded ' + Math.ceil((ev.loaded/ev.total)*100)+'%'); },
        error:function(ev){ $.pnotify({title: "Can't upload", text: ''+ ev, type: 'error'}) },
        success:function(data){
            // Reset file caption
            $('#file_caption').text('Add file...');
            var data = JSON.parse(data);
            if (data.error) {
                $.pnotify({title: 'Unable to upload some files', text: data.error, type: 'error'});
            }
            var items = $('.items');
            var child = uncompress_itemlist(data.children);
            for (var i=0 ; i<child.length ; i++) {
                items.isotope('insert', ItemTool.make_item(child[i]));
            }
            setTimeout( function() {
                if (child.length === 0) {
                    $.pnotify({type: 'warning', title: "Upload", text: "No file were uploaded"});
                } else {
                    for (var i=0; i<child.length; i++) {
                        $.pnotify({type: "success", title: "Uploaded", text: child[i].link, delay: 1500});
                    }
                }
                $('div.maincontainer .file-input-name').html('');
            }, 5);
        }
    });
    /*
    ItemTool._uploader = up;
    */
    // #file changed ! need to re-parse the DOM:
    $('#file').attr('title', 'Upload some file');

    // key binding
    window.addEventListener("popstate", function(e) {
        console.log("POPSTATE", e);
//        if(!!e.state) n_w.view_path(e.state.view, {disable_history: true})
        return false;
    });

    // start navigation
    Mousetrap.bind('tab', function(e) {
        if(ui.selected_item === -1) {
            return ui.select_idx(null, 0);
        }
    });
    // navigation commands
    Mousetrap.bind('down', function(e) {
        e.cancelBubble = true;
        return ui.select_next();
    });
    Mousetrap.bind('up', function(e) {
        e.cancelBubble = true;
        return ui.select_prev();
    });
    Mousetrap.bind('enter', function(e) {
        var items = ui.get_items();
        $(items[ui.selected_item]).find('.item_touch:first').trigger('tap');
        return false;
    });
    Mousetrap.bind('backspace', function(e) {
        $('#backlink').click();
        return false;
    });
    Mousetrap.bind('ins', function(e) {
        $('#file').trigger('click');
        return false;
    });
    Mousetrap.bind('del', function(e) {
        $.pnotify({text: 'Could show a delete popup... ?'});
        return false;
    });
    Mousetrap.bind('ctrl+space', function(e) {
        var inp = $('#addsearch_form input[name=text]');
        if(inp.is(':focus')) {
            filter_result('');
        } else {
            inp.focus();
        }
        return false;
    });
    Mousetrap.bind('esc', function(e) {
        return ui.select_idx(ui.selected_item, null);
    });
    Mousetrap.bind('home', function(e) {
        return ui.select_idx(ui.selected_item, 0);
    });
    Mousetrap.bind('end', function(e) {
        return ui.select_idx(ui.selected_item, -1);
    });
    Nano.reload(); // load page
});


// Standard javascript objects overloading

String.prototype.endswith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.prototype.startswith = function(prefix) {
    return !! this.match(RegExp('^'+prefix));
};
// utils
function copy(obj, blacklist) {
    var o = {}
    if (blacklist) {
        for(var key in obj) {
            var blisted = false;
            for (var bl in blacklist) {
                if( blacklist[bl] === key )
                    blisted = true;
            }
            if (! blisted)
                o[key] = obj[key];
        }
    } else {
        for(var key in obj) {
            o[key] = obj[key];
        }
    }
    return o;
};

// from MDN:
function instanceOf(object, constructor) {
    while (object != null) {
        if (object == constructor.prototype)
            return true;
        object = Object.getPrototypeOf(object);
    }
    return false;
}
