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


.. function:: UI.filter_items(filter)

   :arg filter: *(optional)* pattern (regex to look for), if none given, ``#addsearch_form input`` is used
   :type filter: String
 
   Filters the DOM content according to a pattern, if pattern is empty the display will be unfiltered.
   If pattern is prefixed by a name (without spaces) and colon (ex: ``type:``), then the filtering will
   be done against this metadata name.


Navigation
##########

.. function:: UI.fix_nav(link)

     Handles the "click" on the given *link* in the ``.navbar``  (sort criteria)

     Example usage:

     .. code-block:: html

         <a href="#" onclick="fix_nav(this); do_some_action();">link</a>

.. function:: UI.hr_size(size)

     :arg size: a number of bytes (file/data weight)
     :type size: Integer
     :returns: Human readable size
     :rtype: string


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

   .. function:: Nano.level_up

      Back to upper level.

      :arg opts: Available options:

         :disable_history: passed to :func:`Nano.view_path`

      Leaves the current navigation level and reach the parent calling :func:`n_w.view_path`


MimeManager
===========


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

