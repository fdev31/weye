function display(item) {
    // fetch childrens
    $.get('/c'+item.get_ref())
        .success(function(c) {
            base_data = uncompress_resources(c.children);
            console.log(base_data);
            // render
            var is_an_app = false;
            var app_indice = 'infos.js';
            base_data.forEach(function(o) {
                if(o.link === app_indice)
                is_an_app = true;
            })
            // TODO: remove this:
            if(is_an_app) 
                $.pnotify( { type: 'error', text: 'Applications are not supported anymore'} );

            item.children = base_data;
            Nano.set_content(item);
        });
};

