:orphan:
:author: Fabien Devaux
:license: WTFPL
:language: JavaScript

.. default-domain:: js

###############################
Javascript API (application.js)
###############################

.. note:: DOM Element vs JavaScript Object

   When talking about the **DOM Element** representing an item, I'll use |domitem|
   --- otherwise, for **JavaScript** or **Python** data sets, I'll write: |jsitem|.



.. _epiceditor:

Markdown Text Editor
####################



.. data:: epic_opts
     
     options used in EpicEditor_



.. data:: editor

    Object storing the EpicEditor__ object

.. __: http://epiceditor.com/


.. function:: editor_save
     
     Saves the EpicEditor_ content

Filtering
#########

.. data:: current_filter
     
     current pattern used in the last :func:`filter_result`

.. function:: filter_result

     Filter the |domitem|\ s on display, updates the :data:`current_filter` with the applied text pattern.
     
     :arg filter: regex used as filter for the main content, if not passed, ``#addsearch_form``\ 's ``input`` is used
         if `filter` starts with "type:", the the search is done against ``mime`` |domitem|\ 's data ( ``item.data('mime')`` ), else ``'searchable'`` is used.
     :type filter: String



.. _ui:

User Interface
##############


.. function:: show_help
     
     Displays help as notification popups


.. data:: mimes

     Mimes dictionary, contains the "javascript extensions" of a given mime. Currently the only supported property is **display**.

.. function:: hr_size(size)

     :arg size: a number of bytes (file/data weight)
     :type size: Integer
     :returns: Human readable size
     :rtype: string


.. function:: get_view(template, item)

     Returns jQuery element matching `template` using data from `item` |jsitem|\ , following the :ref:`object_model`

     :type template: String
     :arg template: The name of the template to use.

                 .. Attention:: standard templates

                     :file: file display
                     :list: list display, for folders most of the time

     :type template: Object
     :arg item: data used in template, `backlink` and `permalink` will automatically be added

         .. hint::  If the template is not standard, you should load it using `ich.addTemplate(name, mustacheTemplateString) <http://icanhazjs.com/#methods>`_.

     Example:

     .. code-block:: js

        var v=get_view('list', {mime: 'text-x-vcard', child: list_of_children})
        $('#contents').html(v)
        finalize_item_list(v);

     .. seealso:: 

        - :func:`ItemTool.fixit`
        - :func:`ItemTool.prepare`
        - :func:`finalize_item_list`
        - :doc:`templating`



.. class:: ui

    Main UI object, used for navigation logic and state

     .. note:: This is in fact an object/singleton, you should not instanciate it

.. data:: ui.current_item_template

     Active item template name (``view_list_item_big`` by default)

.. data:: ui.permalink

     current page's permalink

.. data:: ui.doc_ref

     current page's item path

.. function:: ui.get_ref(subpath)

     Returns URL for given object *subpath*

     :arg subpath: *name* property of an item ( |jsitem| or |domitem|\ 's data_ )
     :type subpath: String

.. data:: ui.nav_hist

     Stores data about navigation history, to recover selection for instance.

.. data:: ui.selected_item

     Selected item's index

.. function:: ui.load_view

     Display an |jsitem| "fullscreen" (not in a list) from its data (``mime`` property).
     It will try to find a matching key in the :data:`mimes` dictionary.

     Example:

     If mime is "text-html"
         The tested values will be (in this order): **text-html**, **text**, **default**

     :arg item: the |jsitem|

.. function ui.flush_caches

     Flush internal caches (useful on context change)

.. function:: ui.set_context

     sets the ui context, showing/hiding panels accordingly.

     .. attention:: must be called **AFTER** setting view's content

     :arg ctx: the context to set, supported values:
         :folder: Current item is a container
         :item: Current item is a leaf/endpoint

.. function:: ui.select_next

     Selects the next item

.. function:: ui.select_prev

     Selects the previous |domitem|

.. function ui.get_items

     Returns the list of active |domitem|\ s (filter applied)

.. function:: ui.select_idx

     changes selection from old_idx to new_idx
     if new_idx == -1, then selects the last |domitem|

     Calls :func:`ui.save_selected` when finished.

.. function:: ui.save_selected(idx)

     Internal function, used to save navigation history

.. function:: ui.recover_selected

     Recovers selection status for current :data:`ui.doc_ref` in :data:`ui.nav_hist`

Edition
#######

.. function:: save_form()

     Saves the ``#question_popup .editable``

     .. seealso:: :func:`ItemTool.popup`


Navigation
##########

.. function:: fix_nav(link)

     Handles the "click" on the given *link* in the ``.navbar`` 

     Example usage:

     .. code-block:: html

         <a href="#" onclick="fix_nav(this); do_some_action();">link</a>

.. function:: go_back

    Leaves the current navigation level and reach the parent calling :func:`view_path`

.. function:: view_path(path, opts)

     Updates current context to display the object pointed by *path*

     :arg path: URL/path of the ressource to display
     :arg opts: Modifications of the standard behavior,
         currently supported:

         :disable_history: (bool) Do not store change into history


Item related
############

.. class:: ItemTool

     .. note:: This is in fact an object/singleton, you should not instanciate it

.. function:: ItemTool.fixit(data)

     "Fixes" an :ref:`object metadata <object_model>`, currently:

     - missing **title** is set to *link*
     - missing **searchable** is set to "title"
     - missing **editables** is set to "title mime descr"
     - fills **is_data** keyword (should come from *family* instead)


.. function:: ItemTool.from_link(link)

     Returns the |domitem| of a link in current :data:`ui.doc_ref`

     :arg String link: the object name ( |jsitem|\ 's `link` property)

.. function:: ItemTool.execute_evt_handler(e)

     Takes event's parent target ``data('link')`` and execute it:

         - eval code if starts with "js"
         - else, calls :func:`view_path` for the link

     :arg e: event

.. function:: ItemTool.popup_evt_handler(e)

     Call :func:`~ItemTool.popup` on *e*\ 's target

     :arg e: event

.. function:: ItemTool.popup(elt)

     Show an edition popup to edit some |domitem|

     :arg elt: the |domitem| to edit

.. todo:: GET clean meta from /o/<path> (slower but avoid hacks & limitations)
.. todo:: update elt's `data` on save


.. function:: ItemTool.prepare(o)


     Prepares a |domitem|\ , associating touch bindings to it's ``.item_touch`` property:

     :tap: executes :func:`~ItemTool.execute_evt_handler`
     :hold: executes :func:`~ItemTool.popup_evt_handler`
     :swipe: executes :func:`~ItemTool.popup_evt_handler`

     :arg o: Item (jQuery element) to prepare

.. function:: ItemTool.make_item(data)

     Makes a ready to use |domitem| from an |jsitem| owning :ref:`standard properties <object_model>`
     Will call :func:`~ItemTool.fixit` on the `data` and :func:`~ItemTool.prepare` on the `generic_item` template after rendering.

     :arg data: :ref:`object_model`
     :type data: Object

     This object can then be inserted to main list with a single line:

     .. code-block:: js

         $('.items').isotope('insert', ItemTool.make_item(item_data));


.. _compact_form:

.. index:: compact_form

.. function:: uncompress_itemlist(keys_values_array)

     Uncompresses a list of "compact" |jsitem|\ s as returned by :py:func:`weye.root_objects.list_children` for instance.

     :arg keys_values_array: tuple of *property names* and *list of values*. Ex:

        .. code-block:: js
            
           { 'c': ['link', 'age'], 'r': [ ['toto', 1], ['tata', 4], ['titi', 42] ] }

     :returns: "flat" array of objects. Ex:

        .. code-block:: js

           [ {'link': 'toto', 'age': 1}, {'name': 'tata', 'age': 4}, {'name': 'titi', 'age': 42} ]

.. function:: finalize_item_list(o)


     Sets up |isotope| for those items, should be called once the content was updated
     Also calls :func:`ItemTool.prepare` and :func:`ui.recover_selected` .

     :arg o: DOM element containing some ``.items`` Elements

     Example usage::

     .. code-block:: js

        finalize_item_list( $('#contents').html( get_view('list', template_data) ) );


Misc
####

.. function:: copy(obj)

     :arg obj: Object to clone
     :type obj: Object
     :arg blacklist: List of properties to ignore
     :type blacklist: Array of String
     :returns: a new object with the same properties
     :rtype: Object

.. rubric:: permalinks

They are made from ``'#?view=' + ui.doc_ref``

.. seealso:: :js:data:`ui.doc_ref`


----

.. rst-class:: html-toggle

JavaScript reference
====================

`From MDN <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects>`_.


.. function:: Object
.. function:: String
.. function:: Array
.. function:: Integer

.. _isotope: http://isotope.metafizzy.co/
.. _data: http://api.jquery.com/data/

.. |isotope| replace:: `Isotope <isotope>`
.. |domitem| replace:: *DOM* ``.item``
.. |jsitem| replace:: *(Object/dict)* Item

