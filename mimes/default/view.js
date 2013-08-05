function display(item) {
    $('#contents').html( get_view('file', item) );
    ui.set_context('item');
};
