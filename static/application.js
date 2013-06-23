"use strict";

var current_filter = '';

function filter_result(filter) {
    if (typeof(filter) === 'string') {
        current_filter = filter;
    } else {
        current_filter = $('#addsearch_form input[name=text]').val() ;
    }
    if (current_filter.match(RegExp('^type:'))) {
        var t = new RegExp(current_filter.split(':')[1].trim());
        var match_func = function(elt) {
            return elt.data('mime').match(t);
        }
    } else {
        var re = new RegExp( current_filter );
        var match_func = function(elt) {
            return elt.data('link').match(re);
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
    var pattern = $('#addsearch_form input').val();
    var p = $.post('/search', {text: pattern});
    p.success( function(data) {
        var list = $('<ul></ul>');
        ui.doc_ref = '/';
        $('.folder-item').hide();
        $('.pure-item').hide();
        // render item generic template
        var o = $('#contents');
        console.log(data, data.map( function(x) { return {m: 'application-x-executable', f: x} }));
        // TODO: add some text input allowing user to use a "grep"-like feature
        o.html( 
            ich.view_folder({
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
          console.log(data);
      })
     ;
};

function add_new_item() {
    var pattern = $('#addsearch_form input').val();
    console.log(pattern);
    $.post('/push', {text: pattern}).success( function(d) {
        console.log(d);
        $.get(d.href).success(function(d) {
            console.log('render', d);
            $('.items').isotope('insert', ItemTool.render(d));
        });
    });
};

function finalize_item_list(o) {
    ItemTool.prepare(o);
    o.find('.items').isotope({itemSelector: '.item',  layoutMode : 'fitRows'});
};

var ui = new function() {
    this.doc_ref = '/';
    this.nav_hist = {};
    this.selected_item = -1;
    this._cached_filter = null;
    this.flush_caches = function() {
        this._cached_filter = null;
        $('#addsearch_form input[name=text]').val('');
    }

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
    this.select_idx = function(old_idx, new_idx) {
        /* changes selection from old_idx to new_idx
         if new_idx == -1, then selects the last item
         */
        var items = ui.get_items();

        if (new_idx >= items.length)
            new_idx = items.length-1;

        if (old_idx != undefined && !!ui._cached_filter) 
            $(ui._cached_filter[old_idx]).removeClass('highlighted');

        if (new_idx == -1) // allow list to shorten
            new_idx = items.length-1;
        ui._cached_filter = items;
        var n = $(items[new_idx]);
        console.log(n, new_idx, old_idx);
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
        ui.select_idx(null, ui.nav_hist[ui.doc_ref]?ui.nav_hist[ui.doc_ref].selected:0);
    };
    return this;
}();

/* item actions */

var ItemTool = new function() {
    this.execute_evt_handler = function(e) {
        console.log('execute');
        var elt = $(e.target).parent();
        ui.save_selected(elt.index());
        view_path(ui.doc_ref+'/'+elt.data('link'));
    };

    this.popup_evt_handler = function (e) {
        ItemTool.popup($(e.target));
    };

    this.popup = function (elt) {
    //    console.log($('#question_popup'));
        var qp = $('#question_popup');
        if(qp.length != 0) {
            if (qp.css('display') === 'none') {
                qp.remove();
            } else {
                return;
            }
        }
        var actions = ['infos', 'download', 'preferences', 'delete'];
        ich.question({
            header: "Hey!",
            body: ("Here you'll be able to see: <ul><li>" + actions.join('</li><li>') + '</li></ul>')
        }).modal();
    };

    /* setup all item templates within a jQuery element */
    this.prepare = function (o) {
        console.log('prepare', o);
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
//        console.log('rendering', data);
        var o = ich.view_item(data);
        ItemTool.prepare(o);
        return o;
    };

return this;}();

// TODO:
// handle "template_prefix" global variable using "bacon.isMobile()"
// to add a "mobile_" prefix to view_page's templates & co

function go_back() {
    /* returns to parent item */
    var bref = ui.doc_ref.match(RegExp('(.*)/[^/]+$'));
    ui.flush_caches();
    if (!!bref) {
        bref = bref[1] || '/';
        view_path(bref);
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
//    console.log('refocus',elt);
    if (elt.length == 0)
        return;
    var elem_top = elt.offset()['top'];
    var viewport_height = $(window).height();

    // Scroll to the middle of the viewport
    var my_scroll = elem_top - (viewport_height / 2);
    $(window).scrollTop(my_scroll);
};

function view_path(path) {
    ui.flush_caches();
    /* document viewer, give it a valid path */
//    console.log('view_path', path);
    $('audio').each( function() {this.pause(); this.src = "";} );
    $('.row-fluid').fadeOut('fast');
    setTimeout( function() {
        $.get('/o'+path)
        .success(function(d) {
//            console.log('object: /o/'+path, d);
            if (d.error) {
                $.pnotify({
                    title: 'Error displaying "'+d.link+'" content',
                    text: d.message
                });
            } else {
                // normal continuation
                /* update current document reference */
                if (path !== '/') {
                    ui.doc_ref = path;
                } else {
                    ui.doc_ref = '/';
                }
                /* compute back ref & permalink */
                var plink = window.location + '?view=' + path;
                $('#up_panel').addClass('hidden')
                var o = $('#contents'); /* get main content DOM element */
                var bref = ui.doc_ref != '/';
                if (d.mime === "folder") {
                    setTimeout( function() {
                        ui.recover_selected();
                    }, 1002);
                    // Current document is a folder
                    $('.folder-item').show();
                    $('.pure-item').hide();
                    // fetch childrens
                    $.get('/c'+path)
                        .success(function(c) {
//                            console.log('children: /c/'+path);
                            // render
                            base_data = c;
                            o.html( 
                                ich.view_folder({
                                    mime: d.mime,
                                    path: d.path,
                                    have_child: c.length>0,
                                    child: c,
                                    backlink: bref,
                                    permalink: plink
                                })
                            );
                            // make those items funky
                            finalize_item_list(o);
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
                        permalink: plink
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
                        $('<iframe class="span11" width="100%" height="100%" src="/d'+path+'" />').appendTo(o);
                    }
                }
                // finished successfuly
                $('.row-fluid').fadeIn('slow');
            }
        }
    )
        .error(function() {
            $.pnotify({ title: 'Error loading "'+path+'"', text: "Server not responding."});
        });
    }, 300);
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
    var up = new uploader($('#file').get(0), {
        url:'/upload',
        extra_data_func: function(data) { console.log('#########', data); return {'prefix': ui.doc_ref} },
        progress:function(ev){ console.log('progress'); _p.html(((ev.loaded/ev.total)*100)+'%'); _p.css('width',_p.html()); },
        error:function(ev){ console.log('error', ev); },
        success:function(data){
            _p.html('100%');
            _p.css('width',_p.html());
            var data = JSON.parse(data);
            console.log(data);
            if (data.error) {
                $.pnotify({title: 'Unable to upload some files', text: data.error});
            }
            var items = $('.items');
            for (var i=0; i<data.child.length;i++) {
            	items.isotope( 'insert', ItemTool.render(data.child[i]) );
            }
        }
    });

    $('#upload').click(function(){
        up.send();
    });

    // key binding

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
        if ($('#download_link').length) {
            ItemTool.popup();
        } else {
            var items=ui.get_items();
            $(items[ui.selected_item]).find('.item_stuff:first').trigger('tap');
        }
        return false;
    });
    Mousetrap.bind('backspace', function(e) {
        var items=$('.items > .item');
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
        console.log(inp.is(':focus'));
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
    setTimeout(function() {
        $.pnotify({
            title: "Keyboard shortcuts!",
            text: "Use UP/DOWN, ENTER/BACKspace, HOME/END to navigate...<br/>Close popups using ESCAPE.",
        });
    }, 1000);
});

