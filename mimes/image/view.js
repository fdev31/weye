function display(item) {
    Nano.set_content(item);
    $('<img class="img-responsive" src="/d'+item.get_ref()+'" />').appendTo( $('#contents'));
};
