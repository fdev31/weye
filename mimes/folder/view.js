function display(item) {
    // fetch childrens
    $.get('/c'+item.path)
        .success(function(c) {
            base_data = uncompress_itemlist(c.children);
            // render
            var is_an_app = false;
            var app_indice = 'infos.js';
            base_data.forEach(function(o) {
                if(o.link === app_indice)
                is_an_app = true;
            })

            ui.plugin = null;
            if(is_an_app) {
                $.ajax({url: '/d'+item.path+'/infos.js', dataType: 'json'})
                    .done( function(d) {
                        ui.plugin = d;
                        if(!!d.templates) {
                            for(var key in d.templates) {
                                ich.addTemplate(key, d.templates[key]);
                            };
                        }
                        load_plugin();
                        // Current document is a folder
                        ui.set_context('folder');
                    })
                    .fail(function(e) {
                        $.pnotify({type: 'error', title: "Invalid data", text: "Impossible to load application informations"});
                        console.log("ERR", e);
                    });
            } else {
                item.have_child = base_data.length > 0; // XXX: is this really needed ??
                item.backlink = ui.doc_ref != '/';
                item.permalink = ui.permalink;
                base_data.forEach(ItemTool.fixit);
                item.child = base_data;
                item.item_template = 'view_list_item_small';
                // render & make those items funky
                finalize_item_list( $('#contents').html( get_view('list', item) ) );
                // Current document is a folder
                ui.set_context('folder');
                if( 0 === item.child.length) {
                    $.pnotify({type: 'info', title: 'Attention', text: 'No item in this folder.', delay: 1000});
                }
            }
        });
};

