function display(item) {
    ui.set_context('item');
    $('#contents').html( get_view('file', item) );
};
