"use strict";

var ui = new function() {
    this.doc_ref = '/';
    this.nav_hist = {};
    this.selected_item = -1;

    this.select_next = function() {
        return ui.select_idx(ui.selected_item, ui.selected_item+1);
    };
    this.select_prev = function() {
        if (ui.selected_item > 0)
            return ui.select_idx(ui.selected_item, ui.selected_item-1);
        return true;
    };
    this.select_idx = function(old_idx, new_idx) {
        /* changes selection from old_idx to new_idx
         if new_idx == -1, then selects the last item
         */
        var items=$('.items > .item');
        if (new_idx >= items.length)
            return true;
        if (old_idx != undefined) 
            $(items[old_idx]).removeClass('highlighted');
        if (new_idx == -1)
            new_idx = items.length-1;
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
        ui.nav_hist[ui.doc_ref].selected = idx;
    };
    this.recover_selected = function() {
        /* set current selected item state from saved history information */
        ui.select_idx(null, ui.nav_hist[ui.doc_ref]?ui.nav_hist[ui.doc_ref].selected:0);
    };
    return this;
}();

/* item actions */

var ItemTool = new function() {
    this.execute = function(e) {
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
                    tap: ItemTool.execute,
                    hold: ItemTool.popup_evt_handler,
                    swipe: ItemTool.popup_evt_handler
                })
        });
        return o;
    };

    this.render = function (data) {
        var o = ich.view_item(data);
        ItemTool.prepare(o);
        return o;
    };

return this;}();

// TODO:
// handle "template_prefix" global variable using "bacon.isMobile()"
// to add a "mobile_" prefix to view_page's templates & co

function go_back() {
    var bref = ui.doc_ref.match(RegExp('(.*)/[^/]+$'));
    if (!!bref) {
        bref = bref[1] || '/';
        view_path(bref);
    }
}

function refocus(elt) {
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
                setTimeout( function() {
                    ui.recover_selected();
                }, 1001);
                /* TODO: use a factory with mustache's lambdas on ich */
                var o = $('#contents'); /* get main content DOM element */
                var bref = ui.doc_ref != '/';
                if (d.mime === "folder") {
                    $('.folder-item').show();
                    $('.pure-item').hide();
                    $.get('/c'+path)
                        .success(function(c) {
//                            console.log('children: /c/'+path);
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
                            o.find('.items').isotope({itemSelector: '.item',  layoutMode : 'fitRows'});
                            ItemTool.prepare(o);
                        });
                } else {
                    $('.folder-item').hide();
                    $('.pure-item').show();
                    o.html( ich.view_file({
                        item: d,
                        path: path,
                        backlink: bref,
                        permalink: plink
                        })
                   );
                    // MIME Handling
                    if (d.mime == 'video') {
                        $('<video controls src="/d'+path+'">Alt descr</video>').appendTo(o);
                    } else if (d.mime.match(RegExp('^image'))) {
                        $('<img src="/d'+path+'" />').appendTo(o);
                    } else if (d.mime.match(RegExp('^audio'))) {
                        $('<audio src="/d'+path+'" controls><span>Audio preview not supported on your browser</span></audio>').appendTo(o);
                    } else if (d.mime.match(RegExp('^text')) || d.mime == 'application-json' || d.mime == 'application-x-javascript') {
                        $('<iframe class="row" width="100%" height="100%" src="/d'+path+'" />').appendTo(o);
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

ks.ready(function() {

    // JavaScript placed here will run only once Kickstrap has loaded successfully.
    // init the application
  
    view_path(document.location.href.split(/\?view=/)[1] || '/');

    var $b = $('#upload'),
    $f = $('#file'),
    $p = $('#progress'),
    up = new uploader($f.get(0), {
        url:'/upload',
        extra_data_func: function(data) { console.log('#########', data); return {'prefix': ui.doc_ref} },
        progress:function(ev){ console.log('progress'); $p.html(((ev.loaded/ev.total)*100)+'%'); $p.css('width',$p.html()); },
        error:function(ev){ console.log('error', ev); },
        success:function(data){
            $p.html('100%');
            $p.css('width',$p.html());
            var data = JSON.parse(data);
            if (data.error) {
                $.pnotify({title: 'Unable to upload some files', text: data.error});
            }
            var items = $('.items');
            for (var i=0; i<data.child.length;i++) {
                ItemTool.render(data.child[i]).appendTo(items);
            }
        }
    });

    $b.click(function(){
        up.send();
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
        if ($('#download_link').length) {
            ItemTool.popup();
        } else {
            var items=$('.items > .item');
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
            text: "Use TAB, UP/DOWN & ENTER to navigate...<br/>Close popups using ESCAPE.",
        });
    }, 1000);
});

