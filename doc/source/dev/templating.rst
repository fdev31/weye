##########
Templating
##########

.. role:: xml(code)
   :language: html

.. topic:: Automatic display of correct items in templates

    :.folder-item: *class* in DOM element will show this item only if it's a folder
    :.pure-item: *class* in DOM element will show this item only if it's NOT a folder
    

Main templates
##############

Folder
======

.. topic:: weye.html :xml:`<script id="view_list">`

    .. literalinclude:: ../../../static/weye.html
        :language: django
        :start-after: <script id="view_list"
        :end-before: </script>

File
====

.. topic:: weye.html :xml:`<script id="view_file">`

    .. literalinclude:: ../../../static/weye.html
        :language: django
        :start-after: <script id="view_file"
        :end-before: </script>

Item (in list/folder) templates
###############################


 .. highlight:: xml

Small items (list display)
==========================

.. topic:: weye.html :xml:`<script id="view_list_item_small>`

    .. literalinclude:: ../../../static/weye.html
        :language: django
        :start-after: <script id="view_list_item_small"
        :end-before: </script>



Big items (icon display)
========================

.. topic:: weye.html :xml:`<script id="view_list_item_big">`

    .. literalinclude:: ../../../static/weye.html
        :language: html
        :start-after: <script id="view_list_item_big"
        :end-before: </script>



