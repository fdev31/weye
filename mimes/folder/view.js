function display(item) {
    // fetch childrens
    $.get('/c'+item.get_ref())
        .success(function(c) {
//            console.log(base_data);
            item.children = uncompress_resources(c.children);
            Nano.set_content(item);
        });
};

