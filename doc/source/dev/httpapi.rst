:orphan:

###############
REST (HTTP) API
###############

Routes are defined in :mod:`weye.application`

.. _HTTP_get_object:

/o/<object path> (GET)
######################

Returns metadata for the ressource at *path*, using :func:`weye.root_objects.get_object_from_path`

.. _HTTP_list_children:

/c/<object path> (GET)
######################

Returns children information for the ressource at *path*, using :func:`weye.root_objects.list_children`

.. _HTTP_get_raw_object:

/d/<object path>
################

GET
===

Returns raw data for the ressource at *path*

POST
====

Replaces raw data for the ressource at *path*

.. note:: Only works for text currently, used for :ref:`EpicEditor`\ 's :js:func:`editor_save`

Arguments
---------

:text: content of the text file

/upload
#######

POST
====

Uploads files posted as multipart to the server


Arguments
---------

:prefix: folder/path to upload files to

