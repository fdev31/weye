function display(item) {
    ui.set_context('item');
    $('<audio src="/d'+item.path+'" controls><span>Audio preview not supported on your browser</span></audio>').appendTo(
        $('#contents').html( ich.view_file({
            item: item,
            backlink: ui.doc_ref != '/',
            permalink: ui.permalink
            }
        ))
    );
    $('.filesize').each( function(i, x) { var o=$(x); o.text(hr_size(eval(o.text()))) } );
};
