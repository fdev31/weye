function display(item) {
    $.ajax('/d'+item.path, {dataType: 'text'})
        .done( function(d) {
            var lang = item.mime.split('-')[2];
            var pre = $('<pre><code data-language="'+lang+'"></code></pre>');
            pre.find('code').text(d);
            pre.appendTo(cont);
            Rainbow.color();
        })
        .fail( function(e) {
        });

    var cont = $('#contents').html( get_view('file', item) )
};

