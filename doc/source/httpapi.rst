:orphan:

###############
HTTP (REST) API
###############

Routes are defined in :mod:`weye.application`

/o/<object path>
################

Returns metadata for the ressource at *path*, using :func:`weye.root_objects.get_object_from_path`

/c/<object path>
################

Returns children information for the ressource at *path*, using :func:`weye.root_objects.list_children`

/d/<object path>
################

GET
===

Returns raw data for the ressource at *path*

POST
====

Replaces raw data for the ressource at *path*

/upload
#######

POST
====

Uploads files posted as multipart to the server

Arguments
---------

:prefix: folder/path to upload files to

