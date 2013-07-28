function display(item) {
    ui.set_context('item');
    $('<video controls src="/d'+item.path+'">Alt descr</video>').appendTo(
        $('#contents').html( get_view('file', item) )
    );
};
