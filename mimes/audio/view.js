function display(item) {
    ui.set_context('item');
    $('<audio src="/d'+item.path+'" controls><span>Audio preview not supported on your browser</span></audio>').appendTo(
        $('#contents').html( get_view('file', item) );
    );
};
