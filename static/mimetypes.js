mimes = {
    "audio": {
        display: function (item) {
            $('<audio src="/d'+item.path+'" controls><span>Audio preview not supported on your browser</span></audio>').appendTo(
                $('#contents').html( get_view('file', item) )
            );
            ui.set_context('item');
        }
        ,
        name: "audio"
    }
//  end of AUDIO
    ,
    "default": {
        display: function (item) {
            Nano.set_content(item);
        }
        ,
        name: "default"
    }
//  end of DEFAULT
    ,
    "folder": {
        display: function (item) {
            // fetch childrens
            $.get('/c'+item.get_ref())
                .success(function(c) {
                    base_data = uncompress_resources(c.children);
                    console.log(base_data);
                    // render
                    var is_an_app = false;
                    var app_indice = 'infos.js';
                    base_data.forEach(function(o) {
                        if(o.link === app_indice)
                        is_an_app = true;
                    })
                    // TODO: remove this:
                    if(is_an_app) 
                        $.pnotify( { type: 'error', text: 'Applications are not supported anymore'} );
                    item.children = base_data;
                    Nano.set_content(item);
                });
        }
        ,
        name: "folder"
    }
//  end of FOLDER
    ,
    "image": {
        display: function (item) {
            Nano.set_content(item);
            $('<img class="img-responsive" src="/d'+item.get_ref()+'" />').appendTo( $('#contents'));
        }
        ,
        name: "image"
    }
//  end of IMAGE
    ,
    "text-x": {
        display: function (item) {
            console.log('DISP text-x');
            console.log(item);
            console.log(item.get_ref());
            // Do not forget to EDIT dependencies.js accordingly
            var _map = {
        //        'text-x-c': 'c',
                'text-css': 'css',
                'text-html': 'html',
        //        'text-x-diff': 'diff',
                'application-xhtml+xml': 'html',
                'application-javascript': 'javascript',
        //        'text-x-lua': 'lua',
                'text-x-sh': 'shell'
            }
            // download the content to display it
            $.ajax('/d'+item.get_ref(), {dataType: 'text'})
                .done( function(d) {
                    console.log('done');
                    var lang = _map[item.mime];
                    if( !!! lang )
                        lang = item.mime.split('-')[2];
                    var pre = $('<pre><code data-language="'+lang+'"></code></pre>');
                    pre.find('code').text(d);
                    pre.appendTo($('#contents'));
                    if( item.size > 15000) {
                        $.pnotify({type: 'warning', title: 'File is too big', text: 'Syntax coloring disabled.'});
                    } else {
                        Rainbow.color();
                    }
                })
                .fail( function(e) {
                    $.pnotify({type: 'error', title: 'Loading item', text: e});
                });
            console.log('set_content', item);
            Nano.set_content(item);
        }
        ,
        name: "text-x"        ,
        dependencies:
            [
            // Do not forget to EDIT view.js accordingly
            "myobj.js",
            "rainbow.min.js",
            "lang/generic.js",
            "lang/javascript.js",
            "lang/css.js",
            "lang/c.js",
            "lang/diff.js",
            "lang/html.js",
            "lang/lua.js",
            "lang/shell.js"
            ]

    }
//  end of TEXT-X
    ,
    "text": {
        display: function (item) {
            console.log('display text', item);
            Nano.set_content(item);
            $('<div class="row-fluid"><small>Fullscreen: <i>Alt+F</i>, Toggle preview: <i>Alt+P</i></small></div><div class="row-fluid" id="epiceditor"></div> <div class="pull-right btn-group"></div>').appendTo($('#contents'));
            $('<button class="btn btn-success btn-large" onclick="editor_save()">Save changes</button>')
                .appendTo( $('#download_link').parent() );
            var ajax_call = new $.ajax({url: '/d'+item.get_ref(), dataType: 'text'})
            .fail(function(e) {
                $.pnotify({type: 'error', text: ''+e});
            })
            setTimeout( function() {
                Nano._editor = new EpicEditor(epic_opts);
                Nano._editor.load( function() {
                    ajax_call.done(function(d) {
                        Nano._editor.importFile(item.get_ref(), d);
                    })
                })
            }, 100);
        }
        ,
        name: "text"        ,
        dependencies:
            ['epicobj.js']

    }
//  end of TEXT
    ,
    "video": {
        display: function (item) {
            $('<video controls src="/d'+item.path+'">Alt descr</video>').appendTo(
                $('#contents').html( get_view('file', item) )
            );
            ui.set_context('item');
        }
        ,
        name: "video"
    }
//  end of VIDEO
}
mimes["application-javascript"]=mimes["text-x"]
mimes["text-css"]=mimes["text-x"]
