"use strict";
// TODO: 
//  - Allow setting new mime objects in JavaScript, with some more magical lookup in ResourceFactory
//    - use _get_choices_from_mime in the ResourceFactory, matching mimes dict -- as for templates
//  - Re-Enable edit mode
//
// -- RESOURCE class
function inherits(new_cls, base_cls) {
    new_cls.prototype = Object.create( base_cls.prototype );
    new_cls.prototype.constructor = new_cls;
}

var Templates = {};

function TemplateFactory(item) {
    var t = MimeManager.get_template(item.mime);
    var i = new t(item);
    return i;
}
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
    $('#main_header .filesize').each( function(i, x) {
        var o=$(x);
        if (!!! o.data('_fs_converted')) {
            o.text(UI.hr_size(eval(o.text())));
        }
        o.data('_fs_converted', 1);
    });
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

// -- UI object
var UI = {

    item_template: 'list_item_big',


/*
 * Navigation
 * ##########
 *
 * .. function:: UI.fix_nav(link)
 *
 *      Handles the "click" on the given *link* in the ``.navbar``  (sort criteria)
 *
 *      Example usage:
 *
 *      .. code-block:: html
 *
 *          <a href="#" onclick="fix_nav(this); do_some_action();">link</a>
 */
    fix_nav: function (link) {
        $('div.navbar ul.nav li').removeClass('active');
        $(link).parent().addClass('active');
    },
/*
 * .. function:: UI.hr_size(size)
 *
 *      :arg size: a number of bytes (file/data weight)
 *      :type size: Integer
 *      :returns: Human readable size
 *      :rtype: string
 *
 */
    hr_size: function (size) {
        if (size === undefined) return 'N/A';
        var units = ['', 'k', 'M', 'G'];
        var i = 0;

        while(size >= 1024) { size /= 1024.0; ++i; }

        return size.toFixed(1) + ' ' + units[i]+'B';
    },

    render_dom: function(resource, opts) {
        var resource = copy(resource);
        var opts = opts || {};
        // update headers
        var hdr = $('#main_header');
        resource.permalink = window.location.href;
        hdr.replaceWith( ich.header( resource ) );
        if( Nano.current.get_ref() === '/' ) {
            $('#backlink').addClass('disabled');
        } else {
            $('#backlink').removeClass('disabled');
        }
        // slide content
        setTimeout(function() {
            $('#contents')
            .hide()
            .removeClass('slided_right slided_left');
            // display content
            MimeManager.load_dependencies(resource.mime, {callback: function(found) {
//                console.log('cb !', found, resource);
                found.display(resource);
            }})
            // update content's items according to context
            var name = resource.mime;
            var buttons = $('#addsearch_form');
            buttons.find('button').removeClass('hidden');
            resource.post_view_callback.call(resource);
            // handle history/ backbutton
            if (!!!opts.disable_history)
                history.pushState({'view': ''+Nano.doc_ref}, "Staring at "+Nano.doc_ref, '/#?view='+Nano.doc_ref);
            // show !
            var c = $('#contents');
                c.fadeIn();
        }, 100);
    },

    edit_item : function(data) {
        UI._edited = data;
        var qp = $('#question_popup');
        if(qp.length != 0) {
            if (qp.css('display') === 'none') {
                qp.remove();
            } else {
                return;
            }
        }
        var edited = [];
        if (data.editables === "")  {
            for(var k in data)
                edited.push({name: k, type: 'text'});
        } else {
            var editables = data.editables.split(/ +/);
            // TODO: input type thing
            for(var k in editables) { edited.push({name: editables[k], type: 'text'}) };
        }
        var pop = ich.question({
            'item': data,
            'title': data.title || data.link,
            'mime': data.mime,
            'footnote': 'Changes may be effective after a refresh',
            'edit': edited,
            'buttons': [
                {'name': 'Save', 'onclick': 'UI.save_item($("#question_popup .editable").data("link"));false;', 'class': 'btn-success'},
                {'name': 'Delete', 'onclick': 'UI.remove_item($("#question_popup .editable").data("link"));false;', 'class': 'btn-warning'}
            ]
        });
        pop.modal();
        var edited = $('#question_popup .editable');
        setTimeout(function() {
            pop.find('.editable-property').each( function(i, o) {
                var o = $(o);
                var d = copy(o.data());
                d.content = data[d.name];
                o.append(ich['input_'+d.type](d));
            });
        }, 200);

    },
    remove_item: function() {
        UI._edited.del();
        UI.close_modal();
    },
    save_item: function() {
        var o = $('#question_popup .editable');
        var item = UI._edited;

        var metadata = {};
        var metadata_list = [];
        var full_item = {};

        o.find('.editable-property').each( function(x, property) {
            var property = $(property);
            var inp = property.find('input');
            var orig = inp.data('orig-value');
            var val = inp.val();
            var name = property.data('name');
            if (val !== orig) {
                metadata[name] = inp.val();
                metadata_list.push(name);
            }
        } );

        if (metadata_list.length == 0) {
            $.pnotify({text: 'No change'});
        } else {
            $.ajax(item.get_obj_ref(), {dataType: 'json', data: {meta: JSON.stringify(metadata) }, type: 'PUT'})
                .done( function(e) {
                    Nano.content.refresh_by_link(UI._edited.link, metadata);
                    $.pnotify({type: "success", text: "Saved"});
                    UI.close_modal();
                })
            .fail( function(e) {
                $.pnotify({type: "error", text: ''+e});
            });
        }

    },

    close_modal: function() {
        $('#question_popup').modal('hide', function() {
            console.log('hidden !!');
        });
    },

    find_item_from_child: function(dom) {
        var st = $(dom);
        while (!!! st.hasClass('item') ) {
            if(st.hasClass('items')) {
                st = null;
                break;
            } else {
                st = st.parent();
            }
        }
        return Nano.content.find_by_link(st.data('link'));

    },

    execute_item_handler: function() {
        UI.find_item_from_child(this).view();
    }
};

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
Templates['folder'] = ItemList;

ItemList.prototype.find_by_link = function(link) {
    return this._c[this._index[link]];
};
ItemList.prototype.refresh_by_link = function(link, metadata) {
    var item = this._c[this._index[link]];
    $.extend(item, metadata);
    var e = $('.items .item[data-link="'+item.link+'"]').html(
            ich[this.item_template](item).children().html()
        );
    this.setup_links(e);
};
ItemList.prototype.select = function(index) {
    self.selected += index;
};
ItemList.prototype.insert = function(resource) {
//    console.log('insert', resource, 'into', this);
    var d = ich[this.item_template](resource).children();
    this._index[resource.link] = d;
    this._c.push(d);
    $('.items').isotope('insert', d);
    // new element: $('.items').isotope('insert', DOM_ELT);
};
ItemList.prototype.remove = function(resource) {
    var e = $('.items .item[data-link="'+resource.link+'"]');
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


// -- NANO obj

var Nano = { doc_ref : '/' };
Nano.current = new Resource({link:'', mime:'folder', cont:''});
/*
Nano.get_permalink = function() {
    window.location.href ?
    return '/#?view=' + Nano.doc_ref;
};
*/
Nano.get = function(link) {
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
Nano.set_content = function(item, opts) {
    this.content = TemplateFactory(item);
    this.content.draw();
};
Nano.reload = function() {
    return this.load_resource(this.current);
};
Nano.load_link = function(link, opts) {
    var r = new Resource({link: link}); // create a simple Resource from the link
    Nano.doc_ref = r.cont; // sets current as it's parent to simulate a normal link
    this.load_resource( r, opts); // load it
};
Nano.load_resource = function(resource, opts) {
    if (instanceOf(resource, Item)) {
        Nano._load_resource_cb(resource, opts);
    } else {
        resource.getItem(Nano._load_resource_cb, opts);
    }
};
Nano._load_resource_cb = function(resource, opts) {
    // updates the Page
    var opts = opts || {};
    Nano.doc_ref = resource.get_ref();
//    console.log('load RESOURCE Factory call');
    Nano.current = ResourceFactory(resource);
//    console.log('load RESOURCE render dom');
    UI.render_dom(resource, opts);
};

/*
 *    .. function:: Nano.level_up
 *
 *       Back to upper level.
 *
 *       :arg opts: Available options:
 *
 *          :disable_history: passed to :func:`Nano.view_path`
 *
 *       Leaves the current navigation level and reach the parent calling :func:`n_w.view_path`
 */

Nano.level_up = function(opts) {
    var opts = opts || {};
    var bref = Nano.doc_ref.match(RegExp('(.*)/[^/]+$'));
    /*
    if(!!plugin_cleanup) {
        try {
            plugin_cleanup();
        } catch (e) {
            $.pnotify({type: 'error', title: 'plugin failed to cleanup', text: ''+e});
        }
    }
    */
    if (!!bref) {
        bref = bref[1] || '/';
        $('#contents').addClass('slided_right');
        Nano.load_link(bref, {'history': !!! opts.disable_history});
    }
};

/* MimeManager
 */

var MimeManager = {
    loaded : {}
};

MimeManager.mimes = {};
MimeManager.find_choices = function(mime) {
    var choices = [mime];
    var subchoices = mime.split('-');
    for(var n=subchoices.length-1; n>=1 ; n--) {
        choices.push( subchoices.slice(0, n).join('-') );
    }
    choices.push('default');
    return choices;
}
MimeManager.get_template = function(mime) {
//    console.log('Template factory for:', mime);
    var choices = MimeManager.find_choices(mime);
    for (var i=0; i<choices.length; i++) {
        var choice = choices[i];
        for (var k in Templates) {
            if(k === choice)
                return Templates[k];
        }
    }
    return PageTemplate
};
MimeManager.load_dependencies = function(mime, opts) {
    var opts = opts || {};
    var skip_loading = false;
    // valid opts:
    // - callback
    if(MimeManager.loaded[mime])
        skip_loading = true;
    MimeManager.loaded[mime] = true;

    var found = false;
    var choices = MimeManager.find_choices(mime);

//    console.log('load deps for', choices);

    for (var n=0; (!!! found) && n < choices.length ; n++) {
        try {
            found = Nano.mimes[ choices[n] ];
        } catch(err) {
            found = false;
        }
        if (found) {
            if (!!!skip_loading) {
                var dependencies = [];
                var prefix = '/static/mime/js/' + found.name + '/';
                if( !! found.stylesheet )
                    dependencies.push( prefix + 'style.css' );
                if (found.dependencies) {
                    found.dependencies.forEach( function(x) {
                        if ( x.match(/^[/]/) ) {
                            dependencies.push( x ) 
                        } else {
                            dependencies.push( prefix + x );
                        }
                    })
                }
//                console.log("  => found:", found);
                if (dependencies.length !== 0) {
                    var counter = 0;
                    for (var dep in dependencies) {
//                        console.log( dependencies[dep] );
                        toast(dependencies[dep], function() {
                            if (++counter === dependencies.length) {
//                                console.log('load deps callback');
                                if (opts.callback) {
                                    setTimeout( function() {
                                        opts.callback(found);
                                    }, 100); // force DOM refresh
                                }
                            }
                        } );
                    }
                } else { // no deps
//                    console.log('load deps callback');
                    if (opts.callback) opts.callback(found); // MOTT: just Nano.set_content(item)
                }
            } else {
                if (opts.callback) opts.callback(found); // MOTT: just Nano.set_content(item)
            }
            break;
        }
    }
    if(!!!found) {
        $.pnotify({'type': 'error', 'title': 'Type association', 'text': 'failed loading one of: '+choices});
    }
}

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
        extra_data_func: function(data) { return {'prefix': Nano.doc_ref} },
        progress:function(ev){ $('#file_caption').text('Uploaded ' + Math.ceil((ev.loaded/ev.total)*100)+'%'); },
        error:function(ev){ $.pnotify({title: "Can't upload", text: ''+ ev, type: 'error'}) },
        success:function(data) {
            // Reset file caption
            $('#file_caption').text('Add file...');
            var data = JSON.parse(data);
            if (data.error) {
                $.pnotify({title: 'Unable to upload some files', text: data.error, type: 'error'});
                var child = [];
            } else {
                var child = uncompress_resources(data.children);
                for (var i=0 ; i<child.length ; i++) {
                    var c = child[i];
                    if ( !!! c.title ) c.title = c.link;
                    if ( !!! c.cont ) c.cont = Nano.doc_ref;
                    Nano.content.insert( ResourceFactory(c) );
                }
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
    Nano._uploader = up;
    // #file changed ! need to re-parse the DOM:
    $('#file').attr('title', 'Upload some file');

    // key binding
    setTimeout( function() {
        window.addEventListener("popstate", function(e) {
//            console.log("POPSTATE", e, Nano.current.get_ref());
            if(!!e.state) Nano.load_link(e.state.view, {disable_history: true})
            return false;
        });
    }, 1000); // handle POP after 1s of page loading (avoid strange corner cases when coming back from a RAW item)

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

    Nano.load_link(document.location.href.split(/\?view=/)[1] || '/', {disable_history: true} ); // loads root view
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
