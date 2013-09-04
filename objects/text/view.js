Nano.set_content(this);
$('<div class="row-fluid"><small>Fullscreen: <i>Alt+F</i>, Toggle preview: <i>Alt+P</i></small></div><div class="row-fluid" id="epiceditor"></div> <div class="pull-right btn-group"></div>').appendTo($('#contents'));

$('<button class="btn btn-success btn-large" onclick="editor_save()">Save changes</button>')
    .appendTo( $('#download_link').parent() ).hide().fadeIn();

var ref = this.get_ref();
var ajax_call = new $.ajax({url: this.get_raw_ref(), dataType: 'text'})
.fail(function(e) {
    $.pnotify({type: 'error', text: ''+e});
})

setTimeout( function() {
    Nano._editor = new EpicEditor(epic_opts);
    Nano._editor.load( function() {
        ajax_call.done(function(d) {
            Nano._editor.importFile(ref, d);
        })
    })
}, 100);
