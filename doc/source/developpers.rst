:orphan: 

Developers index
################


.. xx
    No time to detail about real concepts, but here is the libs involved: 
    - `mustache <http://mustache.github.io/>`_
    - `vcs <https://pypi.python.org/pypi/vcs>`_

.. rst-class:: html-toggle

Public APIs
===========

You might be interested in the :ref:`function index <genindex>` as well.

.. toctree::
    :maxdepth: 2

    dev/httpapi
    dev/jsapi
    dev/pyapi
    dev/templating


.. _object_model:


Object model
============

Objects are as much native as possible (``Object`` in JavaScript and ``dict`` in Python). They are stored in a tree, the separator is slash -- ``/`` -- as usual.
When rendered, objects are keeping their data using |data|, so information can be retrieved directly from the view. Keep in mind it is metadata, like links or tags, it shouldn't contain a huge data set, except for text (since it can be handled in the web page natively).

Mandatory
---------

:id: a unique id used for interractions with server
:mime: Some mime type, but instead of slashes you have dashes
:link: The exact file name of the item (used to browse & do queries --- it is the ID)
:size: The "weight" of the item, by default expect bytes (see :js:func:`hr_size`)

:title: The full name of the item (will be set to `mime` if not set) --- *derived from name if not provided*
:editables: space-separated list of editable fields --- *all properties by default (same as "\*")*

Bad example *(lacks some properties, but should work)*

.. code-block:: js

    {id: 43, mime: "text/plain", name: "Fun stuff"}

Recommended
-----------

:family: An additional family --- *Not used yet*
:searchable: A pattern that will be used in filter, in place of `title` --- *defaults to "name"*

Additional
----------

:descr: (description) --- *Not used yet*
:thumb: HTML of a thumbnail for that item
:descr: The (short) description of the item
:classes: Additional (html) classes for this item

.. _customdata:

Custom
------

When returning/interpreting the item (in templates), non-standard metadata are passed to a **data** attribute, a list of **k**\ ey + **v**\ alue as in:

.. code-block:: js

    [ {'k': 'property-name', 'v': 'property-value'}, {'k': 'another prop', 'v': other_val} ]

On the JavaScript object, this data can be accessed via |data| method.

JSON model
==========

When things are returned as collections (Array), to optimize transfers, the format is :js:func:`as follows<uncompress_itemlist>`, it shows some :ref:`custom data <customdata>` as well:

.. code-block:: js

    {'c': ['name', 'mime', 'size', 'data'],
    'r': [
        ['Toto', 'guy', 150, [{'k': 'hair', 'v': 'blond'}]],
        ['Tata', 'guri', 120, [{'k': 'hair', 'v': 'red'}, {k:'nails',v:'blue'}]]
    ]}


.. _data: http://api.jquery.com/data/

.. |data| replace:: jQuery's data_

