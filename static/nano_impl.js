Resource_view = function(path) {
    if (path === Nano.current.get_ref()) return;
    Nano._go_busy();
    var opts = opts || {};
    ui.flush_caches();
    var buttons = $('#addsearch_form');
    /* document viewer, give it a valid path */
    // TODO: plugin deactivate, possible for applications and mimes (as following:)
    Nano._unload_plugins()
    setTimeout( function() {
        $.get('/o'+path)
        .success(function(d) {
            buttons.find('button').removeClass('hidden');
            if (d.error) {
                $.pnotify({
                    title: 'Error displaying "'+d.link+'" content',
                    text: d.message
                });
                Nano._go_ready();
            } else {
                // normal continuation
                /* update current document reference */
                if (path === '/') {
                    d.path = '/';
                } else {
                    // strip start
                    //while(path[1] === '/') path = path.substr(1);
                    // strip end
                    while(path.length > 1 && path.substr(-1) === '/') path = path.substr(0, path.length-1);
                    d.path = path;
                }
                Nano.doc_ref = path;
                if (Nano.doc_ref.endswith('/')) {
                    d.cont = ui.doc_ref;
                } else {
                    d.cont = ui.doc_ref + '/';
                }

                // compute permalink
                // TODO: check if same as doc ref
                var loc = '' + window.location;
                if (loc.search('[?]view=')) {
                    loc = loc.substring(0, loc.search('[?]view='))
                }
                ui.permalink = loc + '?view=' + ui.doc_ref;
                if (!!!opts.disable_history)
                    history.pushState({'view': ''+ui.doc_ref}, "Staring at "+ui.doc_ref, '/#?view='+ui.doc_ref);
//                n_w.load_view(d);
                Nano.display(d);
                Nano._go_ready();
            }
        })
        .error(function() {
            $.pnotify({ title: 'Error loading "'+path+'"', text: "Server not responding."});
            Nano._go_ready();
        });
    }, 3);
}


load_page = function(item) {
    var found = false;

    var choices = [item.mime];

    if (Nano.doc_ref.endswith(item.link)) {
        item.cont = Nano.doc_ref.substr(0, Nano.doc_ref.length - item.link.length);
    } else {
        item.cont = Nano.doc_ref;
    }

    var subchoices = item.mime.split('-');
    for(var n=subchoices.length-1; n>=1 ; n--) {
        choices.push( subchoices.slice(0, n).join('-') );
    }
    choices.push('default');

    for (var n=0; (!!! found) && n < choices.length ; n++) {
        try {
//                conole.log('try '+choices[n]);
            found = Nano.mimes[ choices[n] ];
            var dependencies = [];
            var prefix = '/static/mime/js/' + found.name + '/';
            if( !! found.stylesheet )
                dependencies.push( prefix + 'style.css' );
            if (found.dependencies) {
                found.dependencies.forEach( function(x) {
                    if ( x.match(/^[/]/) ) {
                        dependencies.push( x ) 
                    } else {
                        dependencies.push( prefix + x );
                    }
                })
            }
            if (dependencies.length !== 0) {
                var counter = 0;
                for (var dep in dependencies) {
//                        console.log( dependencies[dep] );
                    toast(dependencies[dep], function() {
                        if (counter++ === dependencies.length) found.display(item)
                    } );
                }
            } else { // no deps
                found.display(item);
            }
            break;
        } catch(err) {
//                console.log(' attempt failed, next...', err);
        }
    }
    if(!!!found) {
        $.pnotify({'type': 'error', 'title': 'Type association', 'text': 'failed loading one of: '+choices});
    }
};
