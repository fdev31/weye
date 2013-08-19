function display(item) {
    console.log('DISP');
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
            pre.appendTo(cont);

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
};

