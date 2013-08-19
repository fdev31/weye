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
            if(is_an_app) {
                $.ajax({url: '/d'+item.cont+item.link+'/infos.js', dataType: 'json'})
                    .done( function(d) {
                        ui.plugin = d;
                        if(!!d.templates) {
                            for(var key in d.templates) {
                                if(!!! ich[key] )
                                    ich.addTemplate(key, d.templates[key]);
                            };
                        }
                        load_plugin();
                        // Current document is a folder
                        Nano.set_context('folder');
                    })
                    .fail(function(e) {
                        $.pnotify({type: 'error', title: "Invalid data", text: "Impossible to load application informations"});
                        console.log("ERR", e);
                    });
            } else {
                item.children = base_data;
                Nano.set_content(item);
            }
        });
};

