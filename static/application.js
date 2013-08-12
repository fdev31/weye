"use strict";
/* :orphan:
 * :author: Fabien Devaux
 * :license: WTFPL
 * :language: JavaScript
 *
 * .. default-domain:: js
 *
 * ###############################
 * Javascript API (application.js)
 * ###############################
 *
 *
 * When talking about the *DOM* Element representing an item, I'll use `.item`. If I write about the :ref:`JavaScript object <object_model>`, I'll just say item.
 */

// Standard javascript objects overloading

String.prototype.endswith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/*
 *
 * .. _epiceditor:
 *
 * Markdown Text Editor
 * ####################
 *
 *
 *
 * .. data:: epic_opts
 *      
 *      options used in EpicEditor_
 *
 */


var epic_opts = {
  container: 'epiceditor',
  textarea: null,
  basePath: '/static',
  clientSideStorage: true,
  localStorageName: 'epiceditor',
  useNativeFullscreen: true,
  parser: marked,
  file: {
    name: 'epiceditor',
    defaultContent: '',
    autoSave: 100
  },
  theme: {
    base: '/themes/epic/base/epiceditor.css',
    preview: '/themes/epic/preview/preview-dark.css',
    editor: '/themes/epic/editor/epic-dark.css'
  },
  button: {
    preview: true,
    fullscreen: true
  },
  focusOnLoad: false,
  shortcut: {
    modifier: 18,
    fullscreen: 70,
    preview: 80
  },
  string: {
    togglePreview: 'Toggle Preview Mode',
    toggleEdit: 'Toggle Edit Mode',
    toggleFullscreen: 'Enter Fullscreen'
  }
};

/*
 *
 * .. data:: editor
 *
 *     Object storing the EpicEditor__ object
 *
 * .. __: http://epiceditor.com/
 *
 */

var editor = null;

/*
 * .. function:: editor_save
 *      
 *      Saves the EpicEditor_ content
 */

function editor_save() {
    var text = editor.exportFile(ui.doc_ref);
    $.post('/d'+ui.doc_ref, {text: text, path: ui.doc_ref})
        .done(function(d) {
            if(d.error) {
                $.pnotify({type:'error', text: ''+d.error, title: "Unable to save"});
            } else {
                $.pnotify({type:'success', text: 'File saved'});
            }
        })
        .fail(function(e) {
            $.pnotify({type:'error', text: ''+e, title: "Unable to save"});
        });
};


/*
 * Filtering
 * #########
 *
 * .. data:: current_filter
 *      
 *      current pattern used in the last :func:`filter_result`
 *
 * .. function:: filter_result
 *
 *      Filter the ``.item``\s on display, updates the :data:`current_filter` with the applied text pattern.
 *      
 *      :arg filter: regex used as filter for the main content, if not passed, ``#addsearch_form``\ 's ``input`` is used
 *          if `filter` starts with "type:", the the search is done against ``mime``` item's data, else ``searchable`` is used.
 *      :type filter: String
 *
 */

var current_filter = '';

function filter_result(filter) {
    if (typeof(filter) === 'string') {
        current_filter = filter;
    } else {
        current_filter = $('#addsearch_form input[name=text]').val() ;
    }
    if (current_filter.match(RegExp('^type:'))) {
        var t = new RegExp(current_filter.toLocaleLowerCase().split(':')[1].trim());
        var match_func = function(elt) {
            return elt.data('mime').match(t);
        }
    } else {
        var re = new RegExp( current_filter.toLocaleLowerCase() );
        var match_func = function(elt) {
            var v = !!elt.data('searchable').toLocaleLowerCase().match(re);
            return v;
        };
    }
    $('.item').each(
            function(i, e) {
                var e=$(e);
                if (match_func(e)) {
                    e.addClass('filtered');
                } else {
                    e.removeClass('filtered');
                }
            }
            );
    $('.items').isotope({filter:'.filtered'});
    ui.select_idx(ui.selected_item, 1);
};


function search_for() {
    $.pnotify({type: 'warning', title: "TBD", text: 'Not implemented in this version'});
    // XXX: REPAIR ME
    return;
    var pattern = $('#addsearch_form input').val();
    var p = $.post('/search', {text: pattern});
    p.success( function(data) {
        var list = $('<ul></ul>');
        ui.doc_ref = '/';
        $('.folder-item').hide();
        $('.pure-item').hide();
        // render item generic template
        var o = $('#contents');
//        console.log(data, data.map( function(x) { return {m: 'application-x-executable', f: x} }));
        // TODO: add some text input allowing user to use a "grep"-like feature
        data.forEach( ItemTool.fixit );
        o.html( 
            ich.view_list({
                mime: 'application-x-executable',
                path: '/',
                child: data,
                backlink: false,
                permalink: '/'
            })
        );
        finalize_item_list(o);
      })
     .error(function(data) {
         $.pnotify({type: 'error', title: "Search failed", text: ''+data});
      })
     ;
};

function add_new_item() {
    var pattern = $('#addsearch_form input').val();
    $.pnotify({type: 'error', text: 'TBD'});
    return;
    /*
    $.post('/push', {text: pattern}).success( function(d) {
        $.get(d.href).success(function(d) {
            var elt = ItemTool.render(d);
            if(current_filter) elt.addClass('filtered');
            $('.items').isotope('insert', elt);
            filter_result();
        });
    });
    */
};

/*
 * .. _ui:
 *
 * User Interface
 * ##############
 */

/*
 *
 * .. function:: show_help
 *      
 *      Displays help as notification items
 *
 */

function show_help() {
    $.pnotify({
        type: 'info',
        title: "Keyboard shortcuts",
        text: "<ul><li><b>UP</b>/<b>DOWN</b></li><li><b>ENTER</b>/<b>BACKspace</b> </li><li> <b>HOME</b>/<b>END</b> to navigate...</li><li>Close popups using <b>ESCAPE</b></li><li><b>Ctrl+Space</b> & <b>Tab</b> will change focus from text filter to the list</li></ul>",
    });
    setTimeout(function(){
        $.pnotify({
            type: 'info',
            title: "Filter Syntax (Ctrl+Space)",
            text: "<ul><li>You can use any RegExp</li><li>You can use <code>type:</code> prefix to match type instead of name. Ex:<pre>type:image|application</pre><pre>type:zip</pre><pre>f.*png$</pre></li></ul>",
        });
    }, 500);
};

/*
 * .. data:: mimes
 *
 *      Mimes dictionary, contains the "javascript extensions" of a given mime. Currently the only supported property is **display**.
 */

var mimes = {};

/*
 * .. function:: hr_size(size)
 *
 *      :arg size: a number of bytes (file/data weight)
 *      :type size: Integer
 *      :returns: Human readable size
 *      :rtype: string
 *
 */
function hr_size(size) {
    var units = ['', 'k', 'M', 'G'];
    var i = 0;
    
    while(size >= 1024) {
        size /= 1024.0;
        ++i;
    }
    
    return size.toFixed(1) + ' ' + units[i]+'B';
};

/*
 * .. function:: get_view(template, item)
 *
 *      Returns jQuery element matching `template` using data from `item` object, following the :ref:`object_model`
 *
 *      :arg template: The name of the template to use.
 *
 *                  .. Attention:: standard templates
 *
 *                      :file: file display
 *                      :list: list display, for folders most of the time
 *
 *      :arg item: data used in itemplate, `backlink` and `permalink` will automatically be added
 *
 *          .. hint::  If the template is not standard, you should load it using `ich.addTemplate(name, mustacheTemplateString) <http://icanhazjs.com/#methods>`_.
 *
 */

function get_view(template, item) {
//    console.log('get view for', item);
    var elt = copy(item);
    elt.backlink = ui.doc_ref != '/';
    elt.permalink = ui.permalink;
    /*
    if (!!! elt.item_template) {
        elt.item_template = function(a, b) {
                console.log(a, b);
                return "xxx";
            };
    }
    elt.item_template = 'view_list_' + elt.item_template;
    */
    elt.item_template = function() {
        return ich[ui.current_item_template](this).html();
    }
    return ich['view_'+template](elt);
};


/*
 * .. class:: ui
 *
 *     Main UI object, used for navigation logic and state
 *
 *      .. note:: This is in fact an object/singleton, you should not instanciate it
        .. todo:: create a method to update an item from its name
 */

var ui = new function() {
    /*
     * .. data:: ui.current_item_template
     *
     *      Active item template name (``view_list_item_small`` by default)
     */
    this.current_item_template = 'view_list_item_small';
    /*
     * .. data:: ui.permalink
     *
     *      current page's permalink
     */
    this.permalink = '#';
    /*
     * .. data:: ui.doc_ref
     *
     *      current page's item path
     */
    this.doc_ref = null;
    /*
     * .. function:: ui.get_ref(subpath)
     *
     *      Returns URL for given object *subpath*
     *
     *      :arg subpath: *name* property of an item
     *      :type subpath: String
     */
    this.get_ref = function(subpath) {
        if (this.doc_ref === '/') {
            if (subpath[0] === '/') {
                return subpath;
            } else {
                return '/' + subpath;
            }
        } else {
            if (subpath[0] === '/') {
                return ui.doc_ref + subpath;
            } else {
                return ui.doc_ref + '/' + subpath;
            }
        }
    };
    /*
     * .. data:: ui.nav_hist
     *
     *      Stores data about navigation history, to recover selection for instance.
     */
    this.nav_hist = {};
    /*
     * .. data:: ui.selected_item
     *
     *      Selected item's index
     */
    this.selected_item = -1;
    this._cached_filter = null;
    this.on_hold = true;
    this.reload = function() {
        ui.load_view(ui._cur_item);
    }
    /*
     * .. function:: ui.load_view
     *
     *      Display an item "fullscreen" (not in a list) from its data (``mime`` property).
     *      It will try to find a matching key in the :data:`mimes` dictionary.
     *      Example:
     *
     *      If mime is "text-html"
     *          The tested values will be (in this order): **text-html**, **text**, **default**
     *
     *      :arg item: the item object
     */
    this.load_view = function(item) {
        ui._cur_item = item;
        var found = false;

        var choices = [item.mime];

        if (ui.doc_ref.endswith(item.link)) {
            item._cont = ui.doc_ref.substr(0, ui.doc_ref.length - item.link.length);
        } else {
            item._cont = ui.doc_ref;
        }

        var subchoices = item.mime.split('-');
        for(var n=subchoices.length-1; n>=1 ; n--) {
            choices.push( subchoices.slice(0, n).join('-') );
        }
        choices.push('default');

        for (var n=0; (!!! found) && n < choices.length ; n++) {
            try {
//                conole.log('try '+choices[n]);
                found = mimes[ choices[n] ];
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
                if (dependencies.length !== 0) {
                    var counter = 0;
                    for (var dep in dependencies) {
//                        console.log( dependencies[dep] );
                        toast(dependencies[dep], function() { counter += 1 ; if (counter === dependencies.length) found.display(item) } );
                    }
                } else { // no deps
                    found.display(item);
                }
            } catch(err) {
//                console.log(' attempt failed, next...', err);
            }
        }
        if(!!!found) {
            $.pnotify({'type': 'error', 'title': 'Type association', 'text': 'failed loading one of: '+choices});
        }
    };
    /*
     * .. function ui.flush_caches
     *
     *      Flush internal caches (useful on context change)
     */
    this.flush_caches = function() {
        this._cached_filter = null;
        $('#addsearch_form input[name=text]').val('');
        this.on_hold = true;
    };
    /*
     * .. function:: ui.set_context
     *
     *      sets the ui context, showing/hiding panels accordingly.
     *
     *      .. attention:: must be called **AFTER** setting view's content
     *
     *      :arg ctx: the context to set, supported values:
     *          :folder: Current item is a container
     *          :item: Current item is a leaf/endpoint
     */
    this.set_context = function(ctx) {
        if(ctx == 'folder') {
            $('.folder-item').show();
            $('.pure-item').hide();
        } else if(ctx == 'item') {

            $('.folder-item').hide();
            $('.pure-item').show();
            $('.filesize').each( function(i, x) {
                var o=$(x);
                if (!!! o.data('_fs_converted')) {
                    o.text(hr_size(eval(o.text())));
                }
                o.data('_fs_converted', 1);
            });

        } else {
            $('.folder-item').hide();
            $('.pure-item').hide();
        }
    };
    /*
     * .. function:: ui.select_next
     *
     *      Selects the next item
     */
    this.select_next = function() {
        return ui.select_idx(ui.selected_item, ui.selected_item+1);
    };
    /*
     * .. function:: ui.select_prev
     *
     *      Selects the previous item
     */
    this.select_prev = function() {
        if (ui.selected_item > 0)
            return ui.select_idx(ui.selected_item, ui.selected_item-1);
        return true;
    };
    /*
     * .. function ui.get_items
     *
     *      Returns the list of active items (filter applied)
     */
    this.get_items = function() {
        return $('.items').data('isotope').$filteredAtoms;
    };
    /*
     * .. function:: ui.select_idx
     *
     *      changes selection from old_idx to new_idx
     *      if new_idx == -1, then selects the last item
     *
     *      Calls :func:`ui.save_selected` when finished.
     */
    this.select_idx = function(old_idx, new_idx) {
        if(ui.on_hold )
            return;
        var items = ui.get_items();

        if (new_idx >= items.length)
            new_idx = items.length-1;

        if (old_idx != undefined && !!ui._cached_filter) 
            $(ui._cached_filter[old_idx]).removeClass('highlighted');

        if (new_idx == -1) // allow list to shorten
            new_idx = items.length-1;
        ui._cached_filter = items;
        var n = $(items[new_idx]);
        n.addClass('highlighted');
        ui.save_selected(new_idx);
        refocus(n);
        return false;
    };
    /*
     * .. function:: ui.save_selected(idx)
     *
     *      Internal function, used to save navigation history
     */
    this.save_selected = function(idx) {
        ui.selected_item = idx;
        if(!!!ui.nav_hist[ui.doc_ref])
            ui.nav_hist[ui.doc_ref] = {};
        ui.nav_hist[ui.doc_ref].selected = idx;
//        console.log('save sel 4', ui.doc_ref,'=', idx);
    };
    /*
     * .. function:: ui.recover_selected
     *
     *      Recovers selection status for current :data:`ui.doc_ref` in :data:`ui.nav_hist`
     */
    this.recover_selected = function() {
        /* set current selected item state from saved history information */
        ui.on_hold = false;
        if(!! ui.nav_hist[ui.doc_ref]) {
            var idx = ui.nav_hist[ui.doc_ref].selected;
        } else {
            var idx = 0;
        }
        ui.select_idx(null, idx);
//        console.log('sel 4', ui.doc_ref,'=', idx);
    };
    return this;
}();

/*
 * Edition
 * #######
 *
 * .. function:: save_form()
 *
 *      Saves the ``#question_popup .editable``
 *
 *      .. seealso:: :func:`ItemTool.popup`
 *      .. warning:: FIXME
 *
 *              Currently not refreshing the item's parent display (in case name or mime is changed)
 *
 */

function save_form() {
    var o = $('#question_popup .editable');
    var link_name = o.data('link');
    var object_path = ui.get_ref(link_name);
    var metadata = {};
    var metadata_list = [];
    var full_item = {};

    var close_form = function() {
        $('#question_popup').modal('hide');
        ui.get_items().each(function(x, item) {
            var d=$(item);
            console.log(d.data('link'), link_name);
            if (d.data('link') === link_name) {
                item = d.data();
                $.extend(item, metadata);
                d.html( ich[ui.current_item_template](item).children().children() );
                ItemTool.prepare(d);
            }
        });
        setTimeout( function() {
            o.parent().detach();
        }, 1000);
    }

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
        $.ajax('/o'+object_path, {dataType: 'json', data: {meta: JSON.stringify(metadata) }, type: 'PUT'})
            .done( function(e) {
                close_form();
                $.pnotify({type: "success", text: "Saved"});
            })
        .fail( function(e) {
            $.pnotify({type: "error", text: ''+e});
        });
    }
};

/*
 * Navigation
 * ##########
 *
 * .. function:: fix_nav(link)
 *
 *      Handles the "click" on the given *link* in the ``.navbar`` 
 *
 *      Example usage:
 *
 *      .. code-block:: html
 *
 *          <a href="#" onclick="fix_nav(this); do_some_action();">link</a>
 */
function fix_nav(link) {
    $('div.navbar ul.nav li').removeClass('active');
    $(link).parent().addClass('active');
};

/*
 * .. function:: go_back
 *
 *     Leaves the current navigation level and reach the parent calling :func:`view_path`
 */
function go_back() {
    var opts = opts || {};
//    console.log('go_back');
    var bref = ui.doc_ref.match(RegExp('(.*)/[^/]+$'));
    if(!!plugin_cleanup) {
        try {
            plugin_cleanup();
        } catch (e) {
            $.pnotify({type: 'error', title: 'plugin failed to cleanup', text: ''+e});
        }
    }
    ui.flush_caches();
    if (!!bref) {
        bref = bref[1] || '/';
        $('.items').addClass('slided_right');
        view_path(bref, {'history': !!! opts.disable_history});
    }
};


function go_busy() {
//    $('a.brand').addClass('hot');
};

function go_ready() {
//    $('a.brand').removeClass('hot');
};

/*
 * .. function:: view_path(path, opts)
 *
 *      Updates current context to display the object pointed by *path*
 *
 *      :arg path: URL/path of the ressource to display
 *      :arg opts: Modifications of the standard behavior,
 *          currently supported:
 *
 *          :disable_history: (bool) Do not store change into history
 *
 */
function view_path(path, opts) {
//    console.log('view_path______________________', path, ui.doc_ref);
    if (path === ui.doc_ref) return;
    go_busy();
    var opts = opts || {};
    ui.flush_caches();
    var buttons = $('#addsearch_form');
//    console.log('xxxxxxxxxxx', ui.doc_ref);
    /* document viewer, give it a valid path */
    // TODO: plugin deactivate, possible for applications and mimes (as following:)
    $('audio').each( function() {this.pause(); this.src = "";} );
//    $('.row-fluid').fadeOut('fast');
    setTimeout( function() {
        $.get('/o'+path)
        .success(function(d) {
            buttons.find('button').removeClass('hidden');
//            console.log('object: /o/'+path, d);
            if (d.error) {
                $.pnotify({
                    title: 'Error displaying "'+d.link+'" content',
                    text: d.message
                });
                go_ready();
            } else {
                // normal continuation
                /* update current document reference */
                if (path === '/') {
                    d.path = '/';
                } else {
                    // strip start
                    //while(path[1] === '/') path = path.substr(1);
                    // strip end
                    while(path.length > 1 && path.substr(-1) === '/') path = path.substr(0, path.length-1);
                    d.path = path;
                }
                ui.doc_ref = path;
                if (ui.doc_ref.endswith('/')) {
                    d._cont = ui.doc_ref;
                } else {
                    d._cont = ui.doc_ref + '/';
                }
                ui.permalink = get_permalink();
                if (!!!opts.disable_history)
                    history.pushState({'view': ''+ui.doc_ref}, "Staring at "+ui.doc_ref, '/#?view='+ui.doc_ref);
                /* compute back ref & permalink */
                
                ui.load_view(d);
                go_ready();
            }
        }
    )
        .error(function() {
            $.pnotify({ title: 'Error loading "'+path+'"', text: "Server not responding."});
            go_ready();
        });
    }, 3);
};


/*
 * Item related
 * ############
 *
 * .. class:: ItemTool
 *
 *      .. note:: This is in fact an object/singleton, you should not instanciate it
 */


var ItemTool = new function() {
    /*
     * .. function:: ItemTool.fixit(data)
     *
     *      "Fixes" an :ref:`object metadata <object_model>`, currently:
     *
     *      - missing **title** is set to *link*
     *      - missing **searchable** is set to *title*
     *      - missing **editables** is set to "title mime descr"
     *      - fills **is_data** keyword (should come from *family* instead)
     */
    this.fixit = function (data) {
        if (!!!data.title) data.title = data.link;
        if (!!!data.searchable) data.searchable = data.title;
        if (!!!data.editables) data.editables = 'title mime descr';
        data.is_data = (data.mime !== 'folder')
    };

    this._find_event_target = function(e) {
        var st = $(e.target);
        while (!!! st.hasClass('item') ) {
            if(st.hasClass('items')) {
                st = null;
                break;
            } else {
                st = st.parent();
            }
        }
        return st;
    };

    /*
     * .. function:: ItemTool.execute_evt_handler(e)
     *
     *      Takes event's parent target ``data('link')`` and execute it:
     *
     *          - eval code if starts with "js"
     *          - else, calls :func:`view_path` for the link
     *
     *      :arg e: event
     */

    this.execute_evt_handler = function(e) {
        var elt = ItemTool._find_event_target(e);
        var link = elt.data('link');

        if(!!!link) {
            $.pnotify({type: 'info', text: 'This is not a link!'});
        } else {
//            console.log('EXECUTE ' , link);
            if (!!link.match(/^js:/)) {
                eval( link.substr(3) );
            } else {
                $('.items').addClass('slided_left');
                view_path(ui.get_ref(link));
            }
        }
        e.cancelBubble = true;
    };

    /*
     * .. function:: ItemTool.popup_evt_handler(e)
     *
     *      Call :func:`~ItemTool.popup` on *e*\ 's target
     *
     *      :arg e: event
     */

    this.popup_evt_handler = function (e) {
        ItemTool.popup(ItemTool._find_event_target(e));
        e.cancelBubble = true;
    };
    /*
     * .. function:: ItemTool.popup(elt)
     *
     *      Show an edition popup for the item
     *
     *      :arg elt: DOM element
     */

    this.popup = function (elt) {
        /*
         * .. todo:: GET clean meta from /o/<path> (slower but avoid hacks & limitations)
         * .. todo:: update elt's `data` on save
         *
         */

        $.get('/o' + ui.get_ref(elt.data('link')))
           .done( function(data) {
               if(data.error) {
                   $.pnotify({
                       type: 'error',
                       title: data.name,
                       text: data.message
                   });
                   return;
               }
//               console.log('D=',data);
                var qp = $('#question_popup');
                if(qp.length != 0) {
                    if (qp.css('display') === 'none') {
                        qp.remove();
                    } else {
                        return;
                    }
                }
                var edited = [];
                ItemTool.fixit(data);
                if (data.editables === "")  {
                    for(var k in data) {
                        if (!!!k.match(/^isotope/)) {
                            edited.push({name: k, type: 'text'});
                        }
                    };
                } else {
                    var editables = data.editables.split(/ +/);
                    for(var k in editables) { edited.push({name: editables[k], type: 'text'}) };
                }
                var pop = ich.question({
                    'item': data,
                    'title': data.title || data.name,
                    'mime': data.mime,
                    'footnote': 'Changes may be effective after a refresh',
                    'edit': edited,
                    'buttons': [
                        {'name': 'Save', 'onclick': 'save_form();false;', 'class': 'btn-success'},
                        {'name': 'Delete', 'onclick': 'delete_item();false;', 'class': 'btn-warning'}
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

            }
        )
        .fail(function(e) {
            $.pnotify( {text: ''+e, type: 'error'}
                );
        });
    };

    /*
     * .. function:: ItemTool.prepare(o)
     *
     *
     *      Prepares a DOM ``.item``, associating touch bindings to it's ``.item_touch`` property:
     *
     *      :tap: executes :func:`~ItemTool.execute_evt_handler`
     *      :hold: executes :func:`~ItemTool.popup_evt_handler`
     *      :swipe: executes :func:`~ItemTool.popup_evt_handler`
     *
     *      :arg o: Item (jQuery element) to prepare
     */
    this.prepare = function (o) {
        $(o).find('.item_touch').hammer()
            .bind({
                tap: ItemTool.execute_evt_handler,
                hold: ItemTool.popup_evt_handler,
                swipe: ItemTool.popup_evt_handler
            });
        return o;
    };
    /*
     * .. function:: ItemTool.make_item(data)
     *
     *      Makes some ready to use DOM ``.item`` element from an object owning :ref:`standard properties <object_model>`
     *      Will call :func:`~ItemTool.fixit` on the `data` and :func:`~ItemTool.prepare` on the `generic_item` template after rendering.
     *
     *      :arg data: :ref:`object_model`
     *      :type data: Object
     *
     *      This object can then be inserted to main list with a single line:
     *
     *      .. code-block:: js
     *
     *          $('.items').isotope('insert', ItemTool.make_item(item_data));
     */

    this.make_item = function(data) {
        ItemTool.fixit(data);
        var dom = ich[ui.current_item_template](data);
        ItemTool.prepare(dom);
        return dom;

    };

return this;}();

/*
 *
 * .. _compact_form:
 *
 * (compact form reverter)
 * =======================
 * 
 * .. function:: uncompress_itemlist(keys_values_array)
 *
 *      Uncompresses a list of items as returned by :py:func:`weye.root_objects.list_children` for instance.
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

function uncompress_itemlist(keys_values_array) {
    var keys = keys_values_array.c;
    var list_of_values = keys_values_array.r;
    var ret = [];

    for (var i=0; i<list_of_values.length; i++) {
        var values = list_of_values[i];
        var item = {};
        for (var pid=0; pid<keys.length; pid++) {
            item[ keys[pid] ] = values[pid];
        }
        ret.push( item );
    }
    return ret;
};

/*
 * .. xx: finalize_item_list is unused now (was used in search)
 *
 * .. function:: finalize_item_list(o)
 *
 *
 *      Sets up isotope for those items, should be called once the content was updated
 *      Also calls :func:`ItemTool.prepare` and :func:`ui.recover_selected` .
 *
 *      :arg o: DOM element containing ``.items`` elements
 */
function finalize_item_list(o) {
    o.find('.items').isotope({itemSelector: '.item',  layoutMode : 'fitRows', sortBy: 'type',
        getSortData : {
            title: function ( e ) {
                return e.data('title');
            },
            type: function ( e ) {
                var m = e.data('mime');
                if (m==='folder') {
                    return '!!!!!!!!!!!!!!!!!!!!!'+e.data('title').toLocaleLowerCase();
                }
                return e.data('mime') + e.data('title').toLocaleLowerCase();
            }
        }
    });
    o.find('.items .item').each( function(i, x) { ItemTool.prepare(x) } );
    setTimeout( function() {
        ui.recover_selected();
    }, 1);
};


// TODO:
// handle "template_prefix" global variable using "bacon.isMobile()"
// to add a "mobile_" prefix to view_path's templates & co
//
var plugin_cleanup = false;
var plugin_data = {};

function refocus(elt) {
    /* sets focus on given element */
    if (elt.length == 0)
        return;
    var elem_top = elt.offset()['top'];
    var viewport_height = $(window).height();

    // Scroll to the middle of the viewport
    var my_scroll = elem_top - (viewport_height / 2);
    $(window).scrollTop(my_scroll);
};

var load_plugin = function() {
    $('#contents').html('');
    $.ajax({url:'/d'+ui.get_ref(ui.plugin.js), dataType: 'text'})
    .done(function(d) {
        $('.folder-item').hide();
        $('.pure-item').hide();
        try {
            eval(d);
        } catch(e) {
            $.pnotify({type:'error', text: 'Invalid application code<br/>'+e, title: 'Loading failure'});
            console.log("ERR", e);
        }
    })
    .fail(function(e) {
        $.pnotify({type: 'error', title: "Invalid data", text: "Impossible to load application"});
        console.log("ERR", e);
    });
};

// ON-Ready
var base_data = {};

$(function() {
    // prevent default action
    $('#addsearch_form').submit(function() {return false});

    // handle upload stuff
    var _p = $('#progress');
    $('#file').bootstrapFileInput();
    var up = new uploader($('#file').get(0), {
        url:'/upload',
        extra_data_func: function(data) { return {'prefix': ui.doc_ref} },
        progress:function(ev){ _p.html(Math.ceil((ev.loaded/ev.total)*100)+'%'); _p.css('width',_p.html()); },
        error:function(ev){ $.pnotify({title: "Can't upload", text: ''+ ev, type: 'error'}) },
        success:function(data){
            _p.html('100%');
            _p.css('width',_p.html());
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
                _p.html('');
                _p.css('width', 0);
            }, 5);
        }
    });
    ItemTool._uploader = up;
    // #file changed ! need to re-parse the DOM:
    $('#file').attr('title', 'Upload some file');

    // load page
  
    view_path(document.location.href.split(/\?view=/)[1] || '/');

    // key binding
    window.addEventListener("popstate", function(e) {
        if(!!e.state) view_path(e.state.view, {disable_history: true})
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
        $.pnotify({text: 'Could show an upload popup... ?'});
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
});

/*
 * Misc
 * ####
 *
 * .. function:: copy(obj)
 *
 *      :arg obj: Object to clone
 *      :type obj: Object
 *      :arg blacklist: List of properties to ignore
 *      :type blacklist: Array of String
 *      :returns: a new object with the same properties
 *      :rtype: Object
 */

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

/*
 * .. function:: get_permalink
 *
 *      Computes the current permalink, used by :func:`view_path` to update :data:`ui.permalink`
 */
function get_permalink() {
    // TODO: check if different from ui.doc_ref
    var loc = '' + window.location;
    if (loc.search('[?]view=')) {
        loc = loc.substring(0, loc.search('[?]view='))
    }
    var plink = loc + '?view=' + ui.doc_ref;
    return plink;
}


/*
 * ----
 *
 * JavaScript reference
 * ====================
 *
 * `From MDN <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects>`_.
 *
 * .. function:: Array\ of\ String
 * .. function:: Object
 * .. function:: String
 * .. function:: Array
 * .. function:: Integer
 *
 *
 *
 */

