function display(item) {

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
    $.ajax('/d'+item.path, {dataType: 'text'})
        .done( function(d) {
            var lang = _map[item.mime];
            if( !!! lang )
                lang = item.mime.split('-')[2];
            var pre = $('<pre><code data-language="'+lang+'"></code></pre>');
            pre.find('code').text(d);
            pre.appendTo(cont);

            if( item.size > 15000) {
                $.pnotify({type: 'warning', title: 'File is too big', text: 'Syntax coloring disabled.'});
            } else {
                Rainbow.color();
            }
            ui.set_context('item');
        })
        .fail( function(e) {
            $.pnotify({type: 'error', title: 'Loading item', text: e});
        });

    var cont = $('#contents').html( get_view('file', item) )
};

