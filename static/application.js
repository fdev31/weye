"use strict";

var doc_ref = '/';

var selected_item = -1;

var scroll_values = {
    '/': 0
};

ks.ready(function() {

    // JavaScript placed here will run only once Kickstrap has loaded successfully.
    // init the application
  
    view_path(document.location.href.split(/\?view=/)[1] || '/');

    var $b = $('#upload'),
    $f = $('#file'),
    $p = $('#progress'),
    up = new uploader($f.get(0), {
        url:'/upload',
        extra_data_func: function(data) { console.log('#########', data); return {'prefix': doc_ref} },
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
                render_item(data.child[i]).appendTo(items);
            }
        }
    });

    $b.click(function(){
        up.send();
    });

    // start navigation
    Mousetrap.bind('tab', function(e) {
        if(selected_item === -1) {
            selected_item = 0;
            $('.items > .item:first').addClass('highlighted');
            return false;
        }
    });
    // navigation commands
    Mousetrap.bind('down', function(e) {
        var items=$('.items > .item');
        if (selected_item + 1 < items.length) {
            $(items[selected_item]).removeClass('highlighted');
            selected_item += 1;
            var n = $(items[selected_item]);
            n.addClass('highlighted');
            refocus(n);
            return false;
        }
    });
    Mousetrap.bind('up', function(e) {
        var items=$('.items > .item');
        if (selected_item > 0) {
            $(items[selected_item]).removeClass('highlighted');
            selected_item -= 1;
            var n = $(items[selected_item]);
            n.addClass('highlighted');
            refocus(n);
            return false;
        }
    });
    Mousetrap.bind('enter', function(e) {
        if ($('#download_link').length) {
            popup_menu();
        } else {
            var items=$('.items > .item');
            $(items[selected_item]).find('.item_stuff:first').trigger('tap');
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
        var items=$('.items > .item');
        $(items[selected_item]).removeClass('highlighted');
        selected_item = -1;
        return false;
    });
    setTimeout(function() {
        $.pnotify({
            title: "Keyboard shortcuts!",
            text: "Use TAB, UP/DOWN & ENTER to navigate...<br/>Close popups using ESCAPE.",
        });
    }, 1000);
});

function refocus(elt) {
    var elem_top = elt.offset()['top'];
    var viewport_height = $(window).height();

    // Scroll to the middle of the viewport
    var my_scroll = elem_top - (viewport_height / 2);
    $(window).scrollTop(my_scroll);
};

/* item actions */

function item_execute(e) {
//    console.log('execute');
    var elt = $(e.target);
    view_path(doc_ref+'/'+elt.parent().data('link'));
}

function item_action_popup(e) {
    popup_menu($(e.target));
}

function popup_menu(elt) {
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
}

/* setup all item templates within a jQuery element */
function prepare_items(o) {
    o.find('.item_stuff').each( function(i, x) {
        $(x).hammer()
            .bind({
                tap: item_execute,
                hold: item_action_popup,
                swipe: item_action_popup
            })
    });
    return o;
}

function render_item(data) {
    var o = ich.view_item(data);
    prepare_items(o);
    return o;
}

function go_back() {
    var bref = doc_ref.match(RegExp('(.*)/[^/]+$'));
    if (!!bref) {
        bref = bref[1] || '/';
        view_path(bref);
    }
}
  
// TODO:
// handle "template_prefix" global variable using "bacon.isMobile()"
// to add a "mobile_" prefix to view_page's templates & co

function view_path(path) {
//    console.log('view_path', path);
    $('audio').each( function() {this.pause(); this.src = "";} );
    scroll_values[doc_ref] = window.scrollY;
//    console.log("saving ", window.scrollY);
    $('.row-fluid').fadeOut('fast');
//    console.log('getting '+path);
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
                selected_item = -1;
                /* update current document reference */
                if (path !== '/') {
                    doc_ref = path;
                } else {
                    doc_ref = '/';
                }
                /* compute back ref & permalink */
                var plink = window.location + '?view=' + path;
                /* "reset" scroll factor (XXX) */
                window.scrollBy(0, -window.scrollY);
                setTimeout( function() {
//                    console.log('scroll by', scroll_values[doc_ref] || 0);
                    window.scroll(0, scroll_values[doc_ref] || 0);
                }, 100);
                /* TODO: use a factory with mustache's lambdas on ich */
                var o = $('#contents'); /* get main content DOM element */
                var bref = doc_ref != '/';
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
                            prepare_items(o);
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
                        $('<iframe width="100%" height="100%" src="/d'+path+'" />').appendTo(o);
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
