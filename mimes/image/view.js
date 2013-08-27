function display(item) {
    Nano.set_content(item);
    $('<img class="img-responsive" src="'+item.get_raw_ref()+'" />').appendTo( $('#contents'));
};
