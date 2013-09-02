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



Templates
#########

.. class:: PageTemplate(data, name)

     :arg data: Object to pass to the template
     :arg name: name of the template (without the "view_" prefix)

    .. function:: PageTemplate.from([resource])

         :arg resource: optional resource to use instead of the *data* passed to constructor

         Returns the HTML content

    .. function:: PageTemplate.draw([resource])

         :arg resource: optional resource to use instead of the *data* passed to constructor

         Draws this template on screen, replacing ``#contents`` with :func:`PageTemplate.draw`

    .. function:: PageTemplate.clear()

         Clears display

.. class:: ItemList(data, item_template)

     *Inherits* :class:`PageTemplate`

     Aims at handling a list of :class:`Resource`


    .. function:: ItemList.get_dom(link)

         Get the DOM element used to display some child, by giving its link

         :arg link: Child's link
         :type link: String

         :returns: The DOM element within that page

    .. function:: ItemList.find_by_link(link)

         Get the :class:`Resource` used for this *link*

         :arg link: Child's link
         :type link: String

         :rtype: :class:`Resource`

    .. function:: ItemList.refresh_by_link(link, metadata)

         Refresh DOM informations of the item matching *link*

         :arg link: Child's link
         :type link: String
         :arg metadata: an Object containing some properties to copy on this :class:`Resource`

    .. function:: ItemList.refresh_by_link(link, metadata)


    .. function:: ItemList.insert(resource)

         Add a :class:`Resource` to current Page

    .. function:: ItemList.remove(resource)

         Remove the given :class:`Resource` 

    .. function:: ItemList.sort_by(dom_elt, criteria)

         Call :func:`UI.fix_nav` and change the current sort criteria

Resources and Items
###################


.. class:: Resource(dict)

     The most basic object you can work on

     :arg dict: the Object containing initial metadata for this Resource


    .. data:: Resource.type = 'resource'

         More or less the lowercased name corresponding to this class name

    .. data:: Resource.searchable = 'title'

         Space-separated list of properties available for filtering, see :func:`UI.filter_items`

    .. data:: Resource.dependencies = []

         List of file names to load prior loading this item

    .. data:: Resource.stylesheet = false

         Tells if a style.css file should be loaded for this kind of :class:`Item`

    .. function:: Resource.hg_size

         Returns a human readable size for this :class:`Item`, see :func:`UI.hr_size` .

    .. function:: Resource.getItem

         Returns a fresh item from this one, by requesting data to server.

    .. function:: Resource.post_view_callback

         Called when this item has been loaded. You may add your custom DOM processing here

    .. function:: Resource.edit

         Edit this item, if the :data:`Resource.link`
         TODO: refactor it

    .. function:: Resource.del

         Deletes an item (from server)

    .. function:: Resource.view

         Displays an item, calling :func:`Nano.load_resource`

    .. function:: Resource.get_ref

         Returns resource's path (HTML view)

    .. function:: Resource.get_raw_ref

         Returns resource's path for RAW data

    .. function:: Resource.get_obj_ref

         Returns resource's path for JSON metadata

    .. function:: Resource.get_obj_ref

         Returns resource's path for JSON child resources list

.. class:: Item(dict)

     *Inherits* :class:`Resource`

     Just adds title from link in case it's empty and sets a default description


GUI interactions
################

.. data:: UI

     The UI object ;)

    .. data:: UI.item_template = 'list_item_big'

    .. function:: UI.filter_items(filter)
   
       :arg filter: *(optional)* pattern (regex to look for), if none given, ``#addsearch_form input`` is used
       :type filter: String
     
       Filters the DOM content according to a pattern, if pattern is empty the display will be unfiltered.
       If pattern is prefixed by a name (without spaces) and colon (ex: ``type:``), then the filtering will
       be done against this metadata name.


    .. function:: UI.fix_nav(link)

         Handles the "click" on the given *link* in the ``.navbar``  (sort criteria)

         Example usage:

         .. code-block:: html

             <a href="#" onclick="UI.fix_nav(this); do_some_action();">link</a>

    .. function:: UI.hr_size(size)

         :arg size: a number of bytes (file/data weight)
         :type size: Integer
         :returns: Human readable size
         :rtype: string


    .. function:: UI.render_dom(resource, opts)

         Renders an :class:`Item` by calling it's :func:`Resource.post_view_callback` after calling :func:`MimeManager.load_dependencies`


    .. function:: UI.edit_item(data)

         :arg data: The item to edit
         :type data: :class:`Resource`

    .. function:: UI.remove_item()

         Removes the edited item and close the modal


    .. function:: UI.save_item

         Saves current item metadata
    .. function:: UI.find_item_from_child(dom)

         Returns the DOM element owning the `link` from one of its child elements
         Useful to handle actions / clicks.

##############
CORE FUNCTIONS
##############

.. _compact_form:

.. index:: Compact format

.. function:: uncompress_resources(keys_values_array)

     Uncompresses a list of "compact" |jsitem|\ s as returned by :py:func:`weye.root_objects.list_children` for instance.

     :arg keys_values_array: tuple of *property names* and *list of values*. Ex:

        .. code-block:: js
            
           { 'c': ['link', 'age'], 'r': [ ['toto', 1], ['tata', 4], ['titi', 42] ] }

     :returns: "flat" array of objects. Ex:

        .. code-block:: js

           [ {'link': 'toto', 'age': 1}, {'name': 'tata', 'age': 4}, {'name': 'titi', 'age': 42} ]

.. data:: Nano
     
     This is the main object to use in the API

     .. data:: Nano.doc_ref

         Current document path, ex: "/"

     .. data:: Nano.content

         Current document's template, see :class:`ItemList`

     .. data:: Nano.current

         Current :class:`Resource` in use (displayed / matches :data:`Nano.doc_ref`)

     .. data:: Nano.mimes

         Dictionary of "mime" : :class:`Item` with all registered mimes, see :ref:`Defining a new mime type`


     .. function:: Nano.set_content(item, [opts])

         Displays given :arg:`item`

        :arg item: The ressource that sould be rendered, it's template will be set to :data:`Nano.content`
        :type item: :class:`Resource` 

     .. function:: Nano.reload

        Reloads :data:`~Nano.current` :class:`Item` 

     .. function:: Nano.load_link(link, [opts])

        Loads an :class:`Item` by its link name (using :func:`~Nano.load_resource`)

        :arg link: Either a relative link to current :data:`~Nano.doc_ref` or a full item path
        :arg opts: options passed to :func:`Nano.load_resource`

     .. function:: Nano.load_resource(resource, [opts])

        Loads a :class:`Resource`, if it's a shallow one (no size) then it will fetch the full object first.
        At the end, :func:`UI.render_dom` is called with the *resource*

        :arg resource: the resource to load in :data:`~Nano.current` context
        :type resource: :class:`Resource`
        :arg opts: options passed to :func:`UI.render_dom`

     .. function:: Nano.level_up

        Back to upper level.
        Leaves the current navigation level and reach the parent calling :func:`Nano.load_link`

        :arg opts: Available options:

           :disable_history: passed (negatively) to :func:`Nano.load_link` as "history"




.. data:: MimeManager

   Object handling templates currently, will probably be refactored later.



   .. function:: MimeManager.find_choices(mime)


      :arg mime: The original mime type, a list of mime types sorted by preference is returned
      :type mime: String
      :rtype: Array of String
      :returns: The list of mimes

   .. function:: MimeManager.get_template(mime)

      Get a template suitable for this mime type, the best value from :func:`MimeManager.find_choices` is returned

      :arg mime: The desired mime type
      :returns: a template
      :rtype: :class:`Template`

   .. function:: MimeManager.load_dependencies(item, [opts])

      Load dependencies for the given item

      :arg mime: The desired mime type
      :arg opts: Optional options
         :callback: a function called with the :class:`Resource` as parameter once all dependencies are loaded.

----

.. rst-class:: html-toggle

.. rubric:: JavaScript reference

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

