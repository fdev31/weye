function display(item) {
    console.log('display###########################');

    ui.set_context('item');
    $('<div class="row-fluid"><small>Fullscreen: <i>Alt+F</i>, Toggle preview: <i>Alt+P</i></small></div><div class="row-fluid" id="epiceditor"></div> <div class="pull-right btn-group"></div>').appendTo(
        $('#contents').html( ich.view_file({
            item: item,
            backlink: ui.doc_ref != '/',
            permalink: ui.permalink
            }
        ))
    );

    $('<button class="btn btn-success btn-large" onclick="editor_save()">Save changes</button>')
        .appendTo( $('#download_link').parent() );

    var ajax_call = new $.ajax({url: '/d'+item.path, dataType: 'text'});

    editor = new EpicEditor(epic_opts).load( function() {
        ajax_call.done(function(d) {
            editor.importFile(item.path, d);
        })
        .fail(function(e) {
            $.pnotify({type: 'error', text: ''+e});
        })
    });

    $('.filesize').each( function(i, x) { var o=$(x); o.text(hr_size(eval(o.text()))) } );
};
