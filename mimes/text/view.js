function display(item) {
    Nano.set_content(item);
    $('<div class="row-fluid"><small>Fullscreen: <i>Alt+F</i>, Toggle preview: <i>Alt+P</i></small></div><div class="row-fluid" id="epiceditor"></div> <div class="pull-right btn-group"></div>').appendTo($('#contents'));

    $('<button class="btn btn-success btn-large" onclick="editor_save()">Save changes</button>')
        .appendTo( $('#download_link').parent() );

    var ajax_call = new $.ajax({url: '/d'+item.get_ref(), dataType: 'text'});

    Nano._editor = new EpicEditor(epic_opts).load( function() {
        ajax_call.done(function(d) {
            Nano._editor.importFile(item.get_ref(), d);
        })
        .fail(function(e) {
            $.pnotify({type: 'error', text: ''+e});
        })
    });
};
