"use strict";

/*
 * ##############
 * CORE FUNCTIONS
 * ##############
 *
 * .. _compact_form:
 *
 * .. index:: Compact format
 *
 * .. function:: uncompress_resources(keys_values_array)
 *
 *      Uncompresses a list of "compact" |jsitem|\ s as returned by :py:func:`weye.root_objects.list_children` for instance.
 *
 *      :arg keys_values_array: tuple of *property names* and *list of values*. Ex:
 *
 *         .. code-block:: js
 *             
 *            { 'c': ['link', 'age'], 'r': [ ['toto', 1], ['tata', 4], ['titi', 42] ] }
 *
 *      :returns: "flat" array of objects. Ex:
 *
 *         .. code-block:: js
 *
 *            [ {'link': 'toto', 'age': 1}, {'name': 'tata', 'age': 4}, {'name': 'titi', 'age': 42} ]
 */

function uncompress_resources(keys_values_array) {
    var keys = keys_values_array.c;
    var list_of_values = keys_values_array.r;
    var ret = [];

    for (var i=0; i<list_of_values.length; i++) {
        var values = list_of_values[i];
        var item = {};
        for (var pid=0; pid<keys.length; pid++) {
            item[ keys[pid] ] = values[pid];
        }
        ret.push( ResourceFactory(item) );
    }
    return ret;
};

var Nano = { doc_ref : '/' };
Nano.current = null ; //new Resource({link:'', mime:'folder', cont:''});
Nano._unload_plugins = function() {
    $('audio').each( function() {this.pause(); this.src = "";} );
};
if (!!mimes) {
    Nano.mimes = mimes;
};
Nano.set_content = function(item, opts) {
    this.content = TemplateFactory(item);
    this.content.draw();
};
Nano.reload = function() {
    return this.load_resource(this.current);
};
Nano.load_link = function(link, opts) {
    var r = new Resource({link: link}); // create a simple Resource from the link
    Nano.doc_ref = r.cont; // sets current as it's parent to simulate a normal link
    this.load_resource( r, opts); // load it
};
Nano.load_resource = function(resource, opts) {
    if (instanceOf(resource, Item)) {
        Nano._load_resource_cb(resource, opts);
    } else {
        resource.getItem(Nano._load_resource_cb, opts);
    }
};
Nano._load_resource_cb = function(resource, opts) {
    // updates the Page
    var opts = opts || {};
    Nano.doc_ref = resource.get_ref();
//    console.log('load RESOURCE Factory call');
    Nano.current = resource;
//    console.log('load RESOURCE render dom');
    UI.render_dom(resource, opts);
};

/*
 *    .. function:: Nano.level_up
 *
 *       Back to upper level.
 *
 *       :arg opts: Available options:
 *
 *          :disable_history: passed to :func:`Nano.view_path`
 *
 *       Leaves the current navigation level and reach the parent calling :func:`n_w.view_path`
 */

Nano.level_up = function(opts) {
    var opts = opts || {};
    var bref = Nano.doc_ref.match(RegExp('(.*)/[^/]+$'));
    /*
    if(!!plugin_cleanup) {
        try {
            plugin_cleanup();
        } catch (e) {
            $.pnotify({type: 'error', title: 'plugin failed to cleanup', text: ''+e});
        }
    }
    */
    if (!!bref) {
        bref = bref[1] || '/';
        $('#contents').addClass('slided_right');
        Nano.load_link(bref, {'history': !!! opts.disable_history});
    }
};

/* MimeManager
 */

var MimeManager = {
    loaded : {}
};

MimeManager.mimes = {};
MimeManager.find_choices = function(mime) {
    var choices = [mime];
    var subchoices = mime.split('-');
    for(var n=subchoices.length-1; n>=1 ; n--) {
        choices.push( subchoices.slice(0, n).join('-') );
    }
    choices.push('default');
    return choices;
}
MimeManager.get_template = function(mime) {
//    console.log('Template factory for:', mime);
    var choices = MimeManager.find_choices(mime);
    for (var i=0; i<choices.length; i++) {
        var choice = choices[i];
        for (var k in Templates) {
            if(k === choice)
                return Templates[k];
        }
    }
    return PageTemplate
};
MimeManager.load_dependencies = function(mime, opts) {
    var opts = opts || {};
    var skip_loading = false;
    // valid opts:
    // - callback
    if(MimeManager.loaded[mime])
        skip_loading = true;
    MimeManager.loaded[mime] = true;

    var found = false;
    var choices = MimeManager.find_choices(mime);

//    console.log('load deps for', choices);

    for (var n=0; (!!! found) && n < choices.length ; n++) {
        try {
            found = Nano.mimes[ choices[n] ];
        } catch(err) {
            found = false;
        }
        if (found) {
            if (!!!skip_loading) {
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
//                console.log("  => found:", found);
                if (dependencies.length !== 0) {
                    var counter = 0;
                    for (var dep in dependencies) {
//                        console.log( dependencies[dep] );
                        toast(dependencies[dep], function() {
                            if (++counter === dependencies.length) {
//                                console.log('load deps callback');
                                if (opts.callback) {
                                    setTimeout( function() {
                                        opts.callback(found);
                                    }, 100); // force DOM refresh
                                }
                            }
                        } );
                    }
                } else { // no deps
//                    console.log('load deps callback');
                    if (opts.callback) opts.callback(found); // MOTT: just Nano.set_content(item)
                }
            } else {
                if (opts.callback) opts.callback(found); // MOTT: just Nano.set_content(item)
            }
            break;
        }
    }
    if(!!!found) {
        $.pnotify({'type': 'error', 'title': 'Type association', 'text': 'failed loading one of: '+choices});
    }
}

