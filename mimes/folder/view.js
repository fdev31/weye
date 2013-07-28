function display(item) {
    // Current document is a folder
    ui.set_context('folder');
    // fetch childrens
    $.get('/c'+item.path)
        .success(function(c) {
            // render
            base_data = c;
            var is_an_app = false;
            var app_indice = 'infos.js';
            base_data.forEach(function(o) {
                if(o.f === app_indice)
                is_an_app = true;
            })
            ui.plugin = null;
            if(is_an_app) {
                $.ajax({url: '/d'+item.path+'/infos.js', dataType: 'json'})
                    .done( function(d) {
                        ui.plugin = d;
                        if(!!item.templates) {
                            for(var key in item.templates) {
                                ich.addTemplate(key, item.templates[key]);
                            };
                        }
                        load_plugin();
                    })
                    .fail(function(e) {
                        $.pnotify({type: 'error', title: "Invalid data", text: "Impossible to load application informations"});
                        console.log("ERR", e);
                    });
            } else {
                item.have_child = c.length > 0; // XXX: is this really needed ??
                item.backlink = ui.doc_ref != '/';
                item.permalink = ui.permalink;
                c.forEach(function(e) {
                    if(!!!e.t) e.t = e.f;
                    if(!!!e.e) e.e = 'name';
                    if(!!!e.s) e.s = e.f;
                });
                item.child = c;
                // render & make those items funky
                finalize_item_list( $('#contents').html(ich.view_list(item)) );
            }
        });
};

