function display(item) {
    ui.set_context('item');
    $('<img src="/d'+item.path+'" />').appendTo(
        $('#contents').html( get_view('file', item) )
    );
};
