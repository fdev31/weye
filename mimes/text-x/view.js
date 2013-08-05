function display(item) {
    var _map = {
        'text-x-c': 'c',
        'text-css': 'css',
        'text-html': 'html',
        'application-xhtml+xml': 'html',
        'application-javascript': 'javascript',
        'text-x-lua': 'lua',
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
            Rainbow.color();
            set_context('item');
        })
        .fail( function(e) {
        });

    var cont = $('#contents').html( get_view('file', item) )
};

