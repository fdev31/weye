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
 */

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

editor = null;

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
 *      :arg filter: regex used as filter for the main content, if not passed, ``#addsearch_form``\ 's ``input`` is used
 *          if `filter` starts with "type:", the the search is done against ``mime``` item's data, else ``searchable`` is used.
 *      :type filter: str
 *
 *      Filter the ``.item``\s on display, updates the :data:`current_filter` with the applied text pattern.
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
        o.html( 
            ich.view_list({
                mime: 'application-x-executable',
                path: '/',
                have_child: true,
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

function finalize_item_list(o) {
    o.find('.items').isotope({itemSelector: '.item',  layoutMode : 'fitRows',
        getSortData : {
            name : function ( $elem ) {
                return $elem.data('name');
            },
            type: function ( $elem ) {
                return $elem.data('mime');
            }
        }
    });
    ItemTool.prepare(o);
    setTimeout( function() {
        ui.recover_selected();
    }, 1);
};

/*
 * .. _ui:
 *
 * User Interface
 * ##############
 *
 * .. class:: ui
 *
 *     Main UI object, used for navigation logic and state
 *
 *      .. note:: This is in fact an object/singleton, you should not instanciate it
 */

var ui = new function() {
    this.permalink = '#';
    this.doc_ref = null;
    this.nav_hist = {};
    this.selected_item = -1;
    this._cached_filter = null;
    this.on_hold = true;
    this.flush_caches = function() {
        this._cached_filter = null;
        $('#addsearch_form input[name=text]').val('');
        this.on_hold = true;
    };

    this.select_next = function() {
        return ui.select_idx(ui.selected_item, ui.selected_item+1);
    };
    this.select_prev = function() {
        if (ui.selected_item > 0)
            return ui.select_idx(ui.selected_item, ui.selected_item-1);
        return true;
    };
    this.get_items = function() {
        if ( $('.items > .item.filtered').length != 0 ) {
            return $('.items > .item.filtered');
        } else {
            return $('.items > .item');
        }
    };
    /*
     * .. function:: ui.select_idx
     *
     *      changes selection from old_idx to new_idx
     *      if new_idx == -1, then selects the last item
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
    this.save_selected = function(idx) {
        ui.selected_item = idx;
        if(!!!ui.nav_hist[ui.doc_ref])
            ui.nav_hist[ui.doc_ref] = {};
        ui.nav_hist[ui.doc_ref].selected = idx-1;
    };
    this.recover_selected = function() {
        /* set current selected item state from saved history information */
        ui.on_hold = false;
        ui.select_idx(null, ui.nav_hist[ui.doc_ref]?ui.nav_hist[ui.doc_ref].selected:0);
    };
    return this;
}();

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
 * .. function:: alt_panel_toggle
 *
 *      Display or hide the right panel (with upload form & actions)
 */


function alt_panel_toggle(force) {
    var pan = $('#up_panel');
    var current = !! pan.is(':hidden');
    var delay = 500;
    if (force === current)
        return;
    else if(force === undefined) {
        force = current;
    }
    if(force) {
        $('#aside_toggler_icon')
            .removeClass('icon-chevron-down')
            .addClass('icon-chevron-up');
        pan.parent().animate( {width: '120px'}, delay, function() {
            pan.slideDown();
            pan.removeClass('hidden');
        });
    } else {
        $('#aside_toggler_icon')
            .addClass('icon-chevron-down')
            .removeClass('icon-chevron-up');
        pan.slideUp( function() {
            pan.parent().animate({width: '1em'}, delay, function() {
                pan.addClass('hidden');
            });
        });
    }
    return false;
}

/*
 * Item related
 * ############
 *
 * .. class:: ItemTool
 *
 *      .. note:: This is in fact an object/singleton, you should not instanciate it
 */


var ItemTool = new function() {

    this.execute_evt_handler = function(e) {
        var elt = $(e.target).parent();
        var link = elt.data('link');
        if(!!!link) {
            $.pnotify({type: 'info', text: 'This is not a link!'});
        } else {
            console.log(link);
            if (!!link.match(/^js:/)) {
                eval( link.substr(3) );
            } else {
                ui.save_selected(elt.index());
                view_path(ui.doc_ref+'/'+elt.data('link'));
            }
        }
    };

    this.popup_evt_handler = function (e) {
        ItemTool.popup($(e.target));
    };

    this.popup = function (elt) {
        var qp = $('#question_popup');
        if(qp.length != 0) {
            if (qp.css('display') === 'none') {
                qp.remove();
            } else {
                return;
            }
        }
        var actions = ['infos', 'download', 'preferences', 'delete'];
        var data = copy(elt.data());
        data.path = ui.doc_ref+'/'+data.link;
        data.cont = ui.doc_ref;
        var edited = [];
        if (data.editable === undefined || data.editable === "" || data.editable === "*")  {
            for(var k in data) { edited.push({name: k, type: 'text'}) };
        } else {
            var editables = data.editable.split(/ +/);
            for(var k in editables) { edited.push({name: editables[k], type: 'text'}) };
        }
        var pop = ich.question({
            'item': data,
            'header': "Edition panel",
            'body': '<em class="pull-right">Changes may be effective after a refresh</em>',
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
    };

    /* setup all item templates within a jQuery element */
    this.prepare = function (o) {
        o.find('.item_stuff').each( function(i, x) {
            $(x).hammer()
                .bind({
                    tap: ItemTool.execute_evt_handler,
                    hold: ItemTool.popup_evt_handler,
                    swipe: ItemTool.popup_evt_handler
                })
        });
        return o;
    };

    this.render = function (data) {
        if (!!!data.f || !!!data.m)
            var data = {m: data.mime, f: data.name}
        var o = ich.view_item(data);
        ItemTool.prepare(o);
        return o;
    };

return this;}();

// TODO:
// handle "template_prefix" global variable using "bacon.isMobile()"
// to add a "mobile_" prefix to view_path's templates & co
//
var plugin_cleanup = false;
var plugin_data = {};

function go_back() {
    var opts = opts || {};
    /* returns to parent item */
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
        view_path(bref, {'history': !!! opts.disable_history});
    }
}

function hr_size(size) {
    var units = ['', 'k', 'M', 'G'];
    var i = 0;
    
    while(size >= 1024) {
        size /= 1024.0;
        ++i;
    }
    
    return size.toFixed(1) + ' ' + units[i]+'B';
}

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
    $.ajax({url:'/d'+ui.doc_ref+'/'+ui.plugin.js, dataType: 'text'})
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

function get_permalink() {
    // TODO: check if different from ui.doc_ref
    var loc = '' + window.location;
    if (loc.search('[?]view=')) {
        loc = loc.substring(0, loc.search('[?]view='))
    }
    var plink = loc + '?view=' + ui.doc_ref;
    return plink;
}

function view_path(path, opts) {
    if (path === ui.doc_ref) return;
    var opts = opts || {};
    ui.flush_caches();
    var buttons = $('#addsearch_form');
    /* document viewer, give it a valid path */
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
            } else {
                // normal continuation
                /* update current document reference */
                while(path[1] === '/')
                    path = path.substr(1);
                while(path.length > 1 && path.substr(-1) === '/')
                    path = path.substr(0, path.length-1)
                if (path !== '/') {
                    ui.doc_ref = path;
                } else {
                    ui.doc_ref = '/';
                }
                ui.permalink = get_permalink();
                if (!!!opts.disable_history)
                    history.pushState({'view': ''+ui.doc_ref}, "Staring at "+ui.doc_ref, '/#?view='+ui.doc_ref);
                /* compute back ref & permalink */
                
                alt_panel_toggle(false);
                var o = $('#contents'); /* get main content DOM element */
                var bref = ui.doc_ref != '/';
                if (d.mime === "folder") {
                    // Current document is a folder
                    $('.folder-item').show();
                    $('.pure-item').hide();
                    // fetch childrens
                    $.get('/c'+path)
                        .success(function(c) {
//                            console.log('children: /c/'+path);
                            // render
                            base_data = c;
                            var is_an_app = false;
                            var app_indice = 'infos.js';
                            base_data.forEach(function(o) {
                                if(o.f === app_indice)
                                    is_an_app = true;
                            })
                            ui.plugin = null;
                            if(is_an_app) {
                                $.ajax({url: '/d'+path+'/infos.js', dataType: 'json'})
                                .done( function(d) {
                                    ui.plugin = d;
                                    if(!!d.templates) {
                                        for(var key in d.templates) {
                                            ich.addTemplate(key, d.templates[key]);
                                        };
                                    }
                                    load_plugin();
                                })
                                .fail(function(e) {
                                    $.pnotify({type: 'error', title: "Invalid data", text: "Impossible to load application informations"});
                                    console.log("ERR", e);
                                });
                            } else {
                                d.have_child = c.length > 0; // XXX: is this really needed ??
                                d.backlink = bref;
                                d.permalink = ui.permalink;
                                c.forEach(function(e) {
                                    if(!!!e.t) e.t = e.f;
                                    if(!!!e.e) e.e = 'name';
                                    if(!!!e.s) e.s = e.f;
                                });
                                d.child = c;

                                o.html( ich.view_list(d) );
                                // make those items funky
                                finalize_item_list(o);
                            }
                        });
                } else {
                    // Current document is an item/file
                    $('.folder-item').hide();
                    $('.pure-item').show();
                    // render item generic template
                    o.html( ich.view_file({
                        item: d,
                        path: path,
                        backlink: bref,
                        permalink: ui.permalink
                        })
                   );
                   $('.filesize').each( function(i, x) { var o=$(x); o.text(hr_size(eval(o.text()))) } )
                    // mime-type specific handling (appended to generic template)
                    if (d.mime == 'video') {
                        $('<video controls src="/d'+path+'">Alt descr</video>').appendTo(o);
                    } else if (d.mime.match(RegExp('^image'))) {
                        $('<img src="/d'+path+'" />').appendTo(o);
                    } else if (d.mime.match(RegExp('^audio'))) {
                        $('<audio src="/d'+path+'" controls><span>Audio preview not supported on your browser</span></audio>').appendTo(o);
                    } else if (d.mime.match(RegExp('^text'))) {
//                        $('<iframe class="span11" width="100%" height="100%" src="/d'+path+'" />').appendTo(o);
                        $('<div class="row-fluid"><small>Fullscreen: <i>Alt+F</i>, Toggle preview: <i>Alt+P</i></small></div><div class="row-fluid" id="epiceditor"></div> <div class="pull-right btn-group"></div>').appendTo(o);


                        $('<button class="btn btn-success btn-large" onclick="editor_save()">Save changes</button>')
                        .appendTo( $('#download_link').parent() )

                        editor = new EpicEditor(epic_opts).load( function() {
                            $.get('/d'+path)
                            .done(function(d) {
                                editor.importFile(path, d);
                            })
                            .fail(function(e) {
                                $.pnotify({type: 'error', text: ''+e});
                            });
                        })
                    }
                }
                // finished successfuly
//                $('.row-fluid').fadeIn('slow');
            }
        }
    )
        .error(function() {
            $.pnotify({ title: 'Error loading "'+path+'"', text: "Server not responding."});
        });
    }, 3);
};

// ON-Ready
var base_data = {};

$(function() {
    // prevent default action
    $('#addsearch_form').submit(function() {return false})

    // load page
  
    view_path(document.location.href.split(/\?view=/)[1] || '/');

    // handle upload stuff

    var _p = $('#progress');
    $('#file').bootstrapFileInput();
    $('#up_panel > a.file-input-wrapper').css('width', '94px');
    var up = new uploader($('#file').get(0), {
        url:'/upload',
        extra_data_func: function(data) { return {'prefix': ui.doc_ref} },
        progress:function(ev){ _p.html(((ev.loaded/ev.total)*100)+'%'); _p.css('width',_p.html()); },
        error:function(ev){ $.pnotify({title: "Can't upload", text: ''+ ev, type: 'error'}) },
        success:function(data){
            _p.html('100%');
            _p.css('width',_p.html());
            var data = JSON.parse(data);
            if (data.error) {
                $.pnotify({title: 'Unable to upload some files', text: data.error, type: 'error'});
            }
            var items = $('.items');
            for (var i=0; i<data.child.length;i++) {
            	items.isotope( 'insert', ItemTool.render(data.child[i]) );
            }
            setTimeout( function() {
                _p.html('');
                _p.css('width', 0);
            }, 5);
        }
    });

    $('#upload').click(function(){
        up.send();
    });

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
        return ui.select_next();
    });
    Mousetrap.bind('up', function(e) {
        return ui.select_prev();
    });
    Mousetrap.bind('enter', function(e) {
        var items = ui.get_items();
        $(items[ui.selected_item]).find('.item_stuff:first').trigger('tap');
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
 *      :type obj: object
 *      :returns: a new object with the same properties
 *      :rtype: object
 */

function copy(obj) {
    var o = {}
    for(var key in obj)
        o[key] = obj[key];
    return o;
};

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
}

