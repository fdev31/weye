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

/*
 * .. data:: Nano
 *      
 *      This is the main object to use in the API
 *
 *      .. data:: Nano.doc_ref
 *
 *          Current document path, ex: "/"
 *
 *      .. data:: Nano.content
 *
 *          Current document's template, see :class:`ItemList`
 */

var Nano = { doc_ref : '/' };

/*
 *      .. data:: Nano.current
 *
 *          Current :class:`Resource` in use (displayed / matches :data:`Nano.doc_ref`)
 */
Nano.current = null ; //new Resource({link:'', mime:'folder', cont:''});

Nano._unload_plugins = function() {
    $('audio').each( function() {this.pause(); this.src = "";} );
};
/*
 *      .. data:: Nano.mimes
 *
 *          Dictionary of "mime" : :class:`Item` with all registered mimes, see :ref:`Defining a new mime type`
 *
 */
Nano.mimes = {};
/*
 *      .. function:: Nano.set_content(item, [opts])
 *
 *          Displays given :arg:`item`
 *
 *         :arg item: The ressource that sould be rendered, it's template will be set to :data:`Nano.content`
 *         :type item: :class:`Resource` 
 */
Nano.set_content = function(item, opts) {
    this.content = TemplateFactory(item);
    this.content.draw();
};
/*
 *      .. function:: Nano.reload
 *
 *         Reloads :data:`~Nano.current` :class:`Item` 
 */
Nano.reload = function() {
    return this.load_resource(this.current);
};
/*
 *      .. function:: Nano.load_link(link, [opts])
 *
 *         Loads an :class:`Item` by its link name (using :func:`~Nano.load_resource`)
 *
 *         :arg link: Either a relative link to current :data:`~Nano.doc_ref` or a full item path
 *         :arg opts: options passed to :func:`Nano.load_resource`
 */
Nano.load_link = function(link, opts) {
    var r = new Resource({link: link}); // create a simple Resource from the link
    Nano.doc_ref = r.cont; // sets current as it's parent to simulate a normal link
    this.load_resource( r, opts); // load it
};
/*
 *      .. function:: Nano.load_resource(resource, [opts])
 *
 *         Loads a :class:`Resource`, if it's a shallow one (no size) then it will fetch the full object first.
 *         At the end, :func:`UI.render_dom` is called with the *resource*
 *
 *         :arg resource: the resource to load in :data:`~Nano.current` context
 *         :type resource: :class:`Resource`
 *         :arg opts: options passed to :func:`UI.render_dom`
 */
Nano.load_resource = function(resource, opts) {
    if (resource.size === undefined) {
        resource.getItem(Nano._load_resource_cb, opts);
    } else {
        Nano._load_resource_cb(resource, opts);
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
 *      .. function:: Nano.level_up
 *
 *         Back to upper level.
 *         Leaves the current navigation level and reach the parent calling :func:`Nano.load_link`
 *
 *         :arg opts: Available options:
 *
 *            :disable_history: passed (negatively) to :func:`Nano.load_link` as "history"
 *
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

Nano.register_mime = function(mimetype, classtype) {
    Nano.mimes[mimetype] = classtype;
};

/*
 *
 * .. data:: MimeManager
 *
 *    Object handling templates currently, will probably be refactored later.
 *
 *
 */

var MimeManager = {
    loaded : {}
};

MimeManager.mimes = {};
/*
 *    .. function:: MimeManager.find_choices(mime)
 *
 *
 *       :arg mime: The original mime type, a list of mime types sorted by preference is returned
 *       :type mime: String
 *       :rtype: Array of String
 *       :returns: The list of mimes
 */
MimeManager.find_choices = function(mime) {
    var choices = [mime];
    var subchoices = mime.split('-');
    for(var n=subchoices.length-1; n>=1 ; n--) {
        choices.push( subchoices.slice(0, n).join('-') );
    }
    choices.push('default');
    return choices;
};
/*
 *    .. function:: MimeManager.get_template(mime)
 *
 *       Get a template suitable for this mime type, the best value from :func:`MimeManager.find_choices` is returned
 *
 *       :arg mime: The desired mime type
 *       :returns: a template
 *       :rtype: :class:`Template`
 */
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
    return PageTemplate;
};
/*
 *    .. function:: MimeManager.load_dependencies(item, [opts])
 *
 *       Load dependencies for the given item
 *
 *       :arg mime: The desired mime type
 *       :arg opts: Optional options
 *          :callback: a function called with the :class:`Resource` as parameter once all dependencies are loaded.
 */
MimeManager.load_dependencies = function(item, opts) {
    var opts = opts || {};
    var skip_loading = false;
    // valid opts:
    // - callback
    if(MimeManager.loaded[item.mime])
        skip_loading = true;
    MimeManager.loaded[item.mime] = true;

    if (!!!skip_loading) {
        var dependencies = [];
        var prefix = '/static/mime/js/' + item.type + '/';
        if( !! item.stylesheet )
            dependencies.push( prefix + 'style.css' );
        if (item.dependencies) {
            item.dependencies.forEach( function(x) {
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
                    if (++counter === dependencies.length) {
    //                                console.log('load deps callback');
                        if (!!opts.callback) {
                            setTimeout( function() {
                                opts.callback(item);
                            }, 100); // force DOM refresh
                        }
                    }
                } );
            }
        } else { // no deps
    //                    console.log('load deps callback');
            if (!!opts.callback) opts.callback(item); // MOTT: just Nano.set_content(item)
        }
    } else {
        if (!!opts.callback) opts.callback(item); // MOTT: just Nano.set_content(item)
    }
}

