function display(item) {
    $('<img class="img-responsive" src="/d'+item.path+'" />').appendTo(
        $('#contents').html( get_view('file', item) )
    );
    ui.set_context('item');
};
