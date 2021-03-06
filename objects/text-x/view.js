var TEXT_X_MAX_FILE_SIZE = 50000;
// Do not forget to EDIT dependencies.js accordingly

var me = this;
// download the content to display it
$.ajax(me.get_raw_ref(), {dataType: 'text'})
.done( function(d) {
    var lang = me._map[me.mime]; // see definitions.js
    if( !!! lang )
    lang = me.mime.split('-')[2];
    var pre = $('<pre><code data-language="'+lang+'"></code></pre>');
    pre.find('code').text(d);
    pre.appendTo($('#contents'));

    if( me.size > TEXT_X_MAX_FILE_SIZE) {
        $.pnotify({type: 'warning', title: 'File is too big', text: 'Syntax coloring disabled.'});
    } else {
        Rainbow.color();
    }
})
.fail( function(e) {
    $.pnotify({type: 'error', title: 'Loading item', text: e});
});

Nano.set_content(this);
