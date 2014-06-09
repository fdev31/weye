"use strict";

$(function() {
    // prevent default action
    $('#addsearch_form').submit(function() {return false});

    // handle upload stuff
    $('#file').filestyle();
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


