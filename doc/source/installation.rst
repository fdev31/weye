:orphan: 

Installation guide
##################


The supported method involves uwsgi_. You may have to `download and install it <http://uwsgi-docs.readthedocs.org/en/latest/Install.html>`_.

Dependencies
============

To fully build Nanowork (``make all``) and be able to make changes, you will need:

:make: The well known builder
:lesscss: The `less css <http://lesscss.org/>`_ compiler (``lessc``)

.. _cat:

:jsmin: Any javascript minifier using stdin/stdout

        .. tip:: You can replace it by ``cat`` in the *Makefile* to avoid this dependency

:sphinx: The `documentation builder framework <http://sphinx-doc.org/>`_

.. tip:: Just type ``make`` to know all possible targets, you can then :samp:`make {target}`

Configuring
===========

Edit |nanoconf|, you'll find explanations below:

.. _weye-conf:

[general]
~~~~~~~~~
.. pull-quote::

    home
        Path of the sources (you cloned or unpacked that folder) (ex: ``/home/toto/temporary/weye.git``).
    shared_root
        Used in file manager, this is the path of the root folder you want *Nanowork* to work on.
    file_encoding
        File encoding of your filesystem (*utf-8* by default).
    no_overwrite    
        Set it to `yes`, `true` or `active` to de-activate overwrite on the server. Uploading new files will still granted if **read_only** is false.
    read_only
        Do not allow any write operation.
    debug
        Enable or disables debugging informations (currently broken)

[uwsgi]
~~~~~~~
.. pull-quote::

    .. _chdir_opt:

    chdir
        You must chdir to |nw| sources' path for |nw| to work
    http-socket
        The ``ip:port`` you want to enable |nw| on:

        ip
            The default IP address will only listen on local host, if you want to be accessible from anybody, set it to `0.0.0.0`.
        port
            HTTP port to work on, if you run ``uwsgi`` with a proper configuration you may avoid giving the port number (ex: ``:8080``) on the URL to connect to the server.

Running
=======

.. parsed-literal::

    uwsgi |nanoconf|

.. hint:: You can move and rename the |nanoconf| file of course ! Just think about changing the *uwsgi*\ 's :ref:`chdir option <chdir_opt>` accordingly.

.. important:: You must run ``make mimes`` if you didn't start |nw| using the :ref:`QuickRun` method --- You may need the cat_ trick as well

Custom configurations
=====================

You will find a ready to use **WSGI** object under ``weye.application:application``.


Generated files
###############

:file:`static/mime/js/` and :file:`static/mimetypes.js`
=======================================================

.. hint:: You can rebuild those files using ``make mimes``

- :samp:`mimes/{type}/js/` folders are copied to :samp:`static/mime/js/{type}/`
- Subfolders of :file:`mimes` are parsed and compiled into :file:`static/mimetypes.js`

  :view.js: contains ``function display(item) {}`` definition, executed with item's informations on ready
  :style.css:  *[optional]* a *CSS* file with additional definitions
  :dependencies.js:  *[optional]* contains files to load (relative to :file:`js` folder), currently only *js* files will be loaded automatically.

                    Example:

                    .. code-block:: js

                        [
                        "rainbow.min.js",
                        "foobar.js"
                        ]






:file:`static/css/theme.css`
============================

.. hint:: You can rebuild those files using ``make themes``

The :file:`themes/default.less` file is compiled using *LESS* and the copied to ``theme.css``.

:file:`doc/source/dev/jsapi.rst`
================================

.. hint:: You can rebuild those files using ``make jsapi``

Built from the docstrings in :file:`static/application.js` 

:file:`doc/build/html/index.html`
=================================

.. hint:: You can rebuild those files using ``make doc``

