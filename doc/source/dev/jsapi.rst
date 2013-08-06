:orphan:
:author: Fabien Devaux
:license: WTFPL
:language: JavaScript

.. default-domain:: js

###############################
Javascript API (application.js)
###############################

.. todo:: generalize item object finding (top/bottom), used in touch/click events ...


When talking about the *DOM* Element representing an item, I'll use `.item`. If I write about the :ref:`JavaScript object <object_model>`, I'll just say item.


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

     Filter the ``.item``\s on display, updates the :data:`current_filter` with the applied text pattern.
     
     :arg filter: regex used as filter for the main content, if not passed, ``#addsearch_form``\ 's ``input`` is used
         if `filter` starts with "type:", the the search is done against ``mime``` item's data, else ``searchable`` is used.
     :type filter: str



.. _ui:

User Interface
##############


.. function:: show_help
     
     Displays help as notification items


.. data:: mimes

     Mimes dictionary, contains the "javascript extensions" of a given mime. Currently the only supported property is **display**.

.. function:: hr_size(size)

     :arg size: a number of bytes (file/data weight)
     :type size: integer
     :returns: Human readable size
     :rtype: string


.. function:: alt_panel_toggle

     Display or hide the right panel (with upload form & actions)

.. function:: get_view(template, item)

     Returns jQuery element matching `template` using data from `item` object, following the :ref:`object_model`

     :arg template: The name of the template to use.
                 .. rubric:: standard templates

                 :file: file display
                 :list: list display, for folders most of the time
     :arg item: data used in itemplate, `backlink` and `permalink` will automatically be added

         .. hint::  If the template is not standard, you should load it using `ich.addTemplate(name, mustacheTemplateString) <http://icanhazjs.com/#methods>`_.


.. class:: ui

    Main UI object, used for navigation logic and state

     .. note:: This is in fact an object/singleton, you should not instanciate it

.. data:: ui.permalink

     current page's permalink

.. data:: ui.doc_ref

     current page's item path

.. function:: get_ref(subpath)

     Returns URL for given object *subpath*

.. data:: ui.nav_hist

     Stores data about navigation history, to recover selection for instance.

.. data:: ui.selected_item

     Selected item's index

.. function:: ui.view_item

     Display an item "fullscreen" (not in a list) from its data (``mime`` property).
     It will try to find a matching key in the :data:`mimes` dictionary.
     Example:

     If mime is "text-html"
         The tested values will be (in this order): **text-html**, **text**, **default**

     :arg item: the item object

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

     Selects the previous item

.. function ui.get_items

     Returns the list of active items (filter applied)

.. function:: ui.select_idx

     changes selection from old_idx to new_idx
     if new_idx == -1, then selects the last item

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

     - missing **title** is set to *name*
     - missing **searchable** is set to *title*
     - missing **editables** is set to "name"

.. function:: ItemTool.execute_evt_handler(e)

     Takes event's parent target ``data('link')`` and execute it:

         - eval code if starts with "js"
         - else, calls :func:`view_path` for the link

     :arg e: event

.. function:: ItemTool.popup_evt_handler(e)

     Call :func:`~ItemTool.popup` on *e*\ 's target

     :arg e: event

.. function:: ItemTool.popup(elt)

     Show an edition popup for the item

     :arg elt: DOM element

.. todo:: GET clean meta from /o/<path> (slower but avoid hacks & limitations)
.. todo:: update elt's `data` on save


.. function:: ItemTool.prepare(o)


     Currently, only finds ``.item_stuff`` within the element and associate touch bindings:

     :tap: executes :func:`~ItemTool.execute_evt_handler`
     :hold: executes :func:`~ItemTool.popup_evt_handler`
     :swipe: executes :func:`~ItemTool.popup_evt_handler`

     :arg o: Item (jQuery element) to prepare

.. function:: ItemTool.make_item(data)

     Makes some ready to use DOM element from an object owning :ref:`standard properties <object_model>`
     Will call :func:`~ItemTool.fixit` on the `data` and :func:`~ItemTool.prepare` on the `generic_item` template after rendering.

     :arg data: :ref:`object_model`
     :type data: object

     This object can then be inserted to main list with a single line:

     .. code-block:: js

         $('.items').isotope('insert', ItemTool.make_item(item_data));


.. _compact_form:

(compact form reverter)
=======================

.. function:: uncompress_itemlist(keys_values_array)

     Uncompresses a list of items as returned by :py:func:`weye.root_objects.list_children` for instance.

     :arg keys_values_array: tuple of *property names* and *list of values*. Ex:

        .. code-block:: js
            
           { 'c': ['name', 'age'], 'r': [ ['toto', 1], ['tata', 4], ['titi', 42] ] }

     :returns: "flat" array of objects. Ex:

        .. code-block:: js

           [ {'name': 'toto', 'age': 1}, {'name': 'tata', 'age': 4}, {'name': 'titi', 'age': 42} ]

.. function:: finalize_item_list(o)


     Sets up isotope for those items, should be called once the content was updated
     Also calls :func:`ItemTool.prepare` and :func:`ui.recover_selected` .

     :arg o: DOM element containing ``.items`` elements

Misc
####

.. function:: copy(obj)

     :arg obj: Object to clone
     :type obj: object
     :arg blacklist: List of properties to ignore
     :type blacklist: list of str
     :returns: a new object with the same properties
     :rtype: object

.. function:: get_permalink

     Computes the current permalink, used by :func:`view_path` to update :data:`ui.permalink`
