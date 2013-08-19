"use strict";
var load_page = function(item) {
    var found = false;

    var choices = Nano._get_choices_from_mime(item.mime);

    if (Nano.doc_ref.endswith(item.link)) {
        item.cont = Nano.doc_ref.substr(0, Nano.doc_ref.length - item.link.length);
    } else {
        item.cont = Nano.doc_ref;
    }

    console.log('CHOICES', choices);

    for (var n=0; (!!! found) && n < choices.length ; n++) {
        try {
//                conole.log('try '+choices[n]);
            found = Nano.mimes[ choices[n] ];
            if (!!! found) continue;
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
            console.log("FOUND:", found);
            if (dependencies.length !== 0) {
                var counter = 0;
                for (var dep in dependencies) {
                    console.log( dependencies[dep] );
                    toast(dependencies[dep], function() {
                        console.log('disp', counter, dependencies.length);
                        if (++counter === dependencies.length) found.display(item)
                    } );
                }
            } else { // no deps
                console.log('disp');
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
