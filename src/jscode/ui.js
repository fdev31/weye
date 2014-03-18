"use strict";

/*
 *
 * GUI interactions
 * ################
 *
 * .. data:: UI
 *
 *      The UI object ;)
 */

var UI = {

    /*
     *     .. data:: UI.item_template = 'list_item_big'
     */

    item_template: 'list_item_big',

    /*
     *     .. function:: UI.filter_items(filter)
     *    
     *        :arg filter: *(optional)* pattern (regex to look for), if none given, ``#addsearch_form input`` is used
     *        :type filter: String
     *      
     *        Filters the DOM content according to a pattern, if pattern is empty the display will be unfiltered.
     *        If pattern is prefixed by a name (without spaces) and colon (ex: ``type:``), then the filtering will
     *        be done against this metadata name.
     * 
     */

    filter_items: function(filter) {
        var filter = filter;
        var forced_searchables = null;

        if (typeof(filter) !== 'string') {
            filter = $('#addsearch_form input[name=text]').val();
        }
        // create the match function + deps
        var meta_re = filter.match(RegExp('^([a-z][a-z09]*): *(.*?) *$'));
        if (!!meta_re) {
            var meta = meta_re[1];
            if (meta === 'type')
                meta = 'mime';
            forced_searchables = [meta];
            filter = meta_re[2];
        }
        var re = new RegExp( filter.toLocaleLowerCase() );
        var match_func = function(elt) {
            var searchables = forced_searchables || elt.data('searchable').split(/ +/);
            for (var i=0 ; i<searchables.length ; i++) {
                if (elt.data(searchables[i]).toLocaleLowerCase().match(re))
                    return true;
            }
            return false;
        };

        $('.item').each(
                function(i, e) {
                    var e=$(e);
                    if (match_func(e)) {
                        e.addClass('filtered');
                    } else {
                        e.removeClass('filtered');
                    }
                }
            );
        $('.items').isotope({filter:'.filtered'});
    },
/*
 *     .. function:: UI.fix_nav(link)
 *
 *          Handles the "click" on the given *link* in the ``.navbar``  (sort criteria)
 *
 *          Example usage:
 *
 *          .. code-block:: html
 *
 *              <a href="#" onclick="UI.fix_nav(this); do_some_action();">link</a>
 */
    fix_nav: function (link) {
        $('div.navbar ul.nav li').removeClass('active');
        $(link).parent().addClass('active');
    },
/*
 *     .. function:: UI.hr_size(size)
 *
 *          :arg size: a number of bytes (file/data weight)
 *          :type size: Integer
 *          :returns: Human readable size
 *          :rtype: string
 *
 */
    hr_size: function (size) {
        if (size === undefined) return 'N/A';
        var units = ['', 'k', 'M', 'G'];
        var i = 0;

        while(size >= 1024) { size /= 1024.0; ++i; }

        return size.toFixed(1) + ' ' + units[i]+'B';
    },
/*
 *     .. function:: UI.render_dom(resource, opts)
 *
 *          Renders an :class:`Item` by calling it's :func:`Resource.post_view_callback` after calling :func:`MimeManager.load_dependencies`
 *
 */

    render_dom: function(resource, opts) {
        var resource = copy(resource);
        var opts = opts || {};
        // update headers
        var hdr = $('#main_header');
        resource.permalink = window.location.href;
        hdr.replaceWith( ich.header( resource ) );
        if( Nano.current.get_ref() === '/' ) {
            $('#backlink').addClass('disabled');
        } else {
            $('#backlink').removeClass('disabled');
        }
        // slide content
        setTimeout(function() {
            $('#contents')
            .hide()
            .removeClass('slided_right slided_left');
            // display content
            MimeManager.load_dependencies(resource, {callback: function(found) {
//                console.log('cb !', found, resource);
                // update content's items according to context
                var buttons = $('#addsearch_form');
                buttons.find('button').removeClass('hidden');
                resource.post_view_callback.call(resource);
                // handle history/ backbutton
                if (!!!opts.disable_history)
                    history.pushState({'view': ''+Nano.doc_ref}, "Staring at "+Nano.doc_ref, '/#?view='+Nano.doc_ref);
                // show !
                var c = $('#contents');
                    c.fadeIn();
            }})
        }, 100);
    },

    help_popups: function() {
        $.pnotify({
        type: 'info',
        title: "Keyboard shortcuts",
        text: "<ul><li><b>UP</b>/<b>DOWN</b></li><li><b>ENTER</b>/<b>BACKspace</b> </li><li> <b>HOME</b>/<b>END</b> to navigate...</li><li>Close popups using <b>ESCAPE</b></li><li><b>Ctrl+Space</b> & <b>Tab</b> will change focus from text filter to the list</li></ul>",
    });
    setTimeout(function(){
        $.pnotify({
            type: 'info',
            title: "Filter Syntax (Ctrl+Space)",
            text: "<ul><li>You can use any RegExp</li><li>You can use <code>type:</code> prefix to match type instead of name. Ex:<pre>type:image|application</pre><pre>type:zip</pre><pre>f.*png$</pre></li></ul>",
        });
    }, 500);
    },

    get_question: function(opts /* item, mime, title, footnote, buttons */) {
        console.log('get Q');
        var item = opts.item || false;
        var mime = opts.mime || (item && item.mime) || 'text-x-readme';
        var title = opts.title || (item && item.title) || (item && item.link) || '';
        var editables = opts.editables || (item && item.editables && item.editables.split(/ +/)) || '*';
        var buttons = opts.buttons || [];
        var footnote = opts.foonote || '';
        var body = opts.body || '';

        /* if we already have a popup */
        var qp = $('#question_popup');
        if(qp.length != 0) {
            if (qp.css('display') === 'none') {
                /* and he is hidden, remove it first */
                qp.remove();
            } else {
                /* something is already displayed, don't do anything */
                return;
            }
        }

        var edited = [];
        if (item) {
            if (editables === '*' || editables === '') {
                for(var k in item)
                    edited.push({name: k, type: 'text'});
            } else {
                // TODO: input type thing
                for(var k in editables) { edited.push({name: editables[k], type: 'text'}) };
            }
        }
        /* create the popup */
        qp = ich.question({
            'item': item,
            'title': title,
            'mime': mime,
            'body': body,
            'footnote': footnote,
            'edit': edited,
            'buttons': buttons
        });
        qp.modal();
        if (item) setTimeout(function() {
            qp.find('.editable-property').each( function(i, o) {
                var o = $(o);
                var d = copy(o.data());
                d.content = item[d.name];
                o.append(ich['input_'+d.type](d));
            });
        }, 200);

        return qp;
    },

    search_popup: function() {
        UI.get_question({
            item: false,
            body: ich.search_popup().html(),
            buttons: [
                {'name': 'Filter', onclick: 'UI.filter_items(); return false', title:'Filters current list'},
                {'name': 'Search', onclick: 'UI.search_for(); return false', title:'Search for some item'}
            ]
        });

    },
/*
 *     .. function:: UI.edit_item(data)
 *
 *          :arg data: The item to edit
 *          :type data: :class:`Resource`
 */

    edit_item : function(data) {
        UI._edited = data;
        UI.get_question({
            item: data,
            footnote: 'Changes may be effective after a refresh',
            buttons: [
                {'name': 'Save', 'onclick': 'UI.save_item($("#question_popup .editable").data("link"));false;', 'class': 'btn-success'},
                {'name': 'Delete', 'onclick': 'UI.remove_item($("#question_popup .editable").data("link"));false;', 'class': 'btn-warning'}
            ]
        });

    },
/*
 *     .. function:: UI.remove_item()
 *
 *          Removes the edited item and close the modal
 *
 */
    remove_item: function() {
        UI._edited.del();
        UI.close_modal();
    },
/*
 *     .. function:: UI.save_item
 *
 *          Saves current item metadata
 */
    save_item: function() {
        var o = $('#question_popup .editable');
        var item = UI._edited;

        var metadata = {};
        var metadata_list = [];
        var full_item = {};

        o.find('.editable-property').each( function(x, property) {
            var property = $(property);
            var inp = property.find('input');
            var orig = inp.data('orig-value');
            var val = inp.val();
            var name = property.data('name');
            if (val !== orig) {
                metadata[name] = inp.val();
                metadata_list.push(name);
            }
        } );

        if (metadata_list.length == 0) {
            $.pnotify({text: 'No change'});
        } else {
            $.ajax(item.get_obj_ref(), {dataType: 'json', data: {meta: JSON.stringify(metadata) }, type: 'PUT'})
                .done( function(e) {
                    Nano.content.refresh_by_link(UI._edited.link, metadata);
                    $.pnotify({type: "success", text: "Saved"});
                    UI.close_modal();
                })
            .fail( function(e) {
                $.pnotify({type: "error", text: ''+e});
            });
        }

    },

    close_modal: function() {
        $('#question_popup').modal('hide', function() {
            console.log('hidden !!');
        });
    },
    /*     .. function:: UI.find_item_from_child(dom)
     *
     *          Returns the DOM element owning the `link` from one of its child elements
     *          Useful to handle actions / clicks.
     */
    find_item_from_child: function(dom) {
        var st = $(dom);
        while (!!! st.hasClass('item') ) {
            if(st.hasClass('items')) {
                st = null;
                break;
            } else {
                st = st.parent();
            }
        }
        return Nano.content.find_by_link(st.data('link'));
    },

    execute_item_handler: function() {
        UI.find_item_from_child(this).view();
    }
};
