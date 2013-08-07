
##################################
Welcome to |nw|\ 's documentation!
##################################

:Author: Fabien Devaux
:License: WTFPL
:Language: JavaScript and Python
:OS: Should be portable but tested on Linux only.



.. warning:: This project is WIP

    The documentation can be synchronized with reality, sometimes.


Description
###########

Spare time project to experiment some HTTP techniques and try to make a good re-usable UI with a simple architecture.

|nw| aims at providing a simple, modular, re-usable code base to develop simple web applications quickly.

Screenshots
###########

.. figure:: _static/shot1.jpg
    :width: 80%
    :align: center

    Main page (file browser)

.. rst-class:: html-toggle

Show more...
============


.. figure:: _static/shot-rawhtml.jpg
    :width: 80%
    :align: center

    Raw files are accessible conserving path consistency, you can share web sites for instance.

.. figure:: _static/shot-smallscreen.jpg
    :align: center

    Rendering on a smaller screen (showing bootstrap feature)

Installing
##########

No installation needed, currently you must use it from the sources folder.
The installation process will come later, with something more like django, to create project folders.

.. pull-quote:: Download `this file <https://github.com/fdev31/weye/archive/master.zip>`_ and then unzip it. You have the sources in a folder now.

Example:

.. code-block:: console
    
    % wget 'https://github.com/fdev31/weye/archive/master.zip' && unzip master

Dependencies
============

Python3
    Refer to your Operating System packaging system or `install it manually <http://python.org/download/>`_

    .. hint:: Python2.6 up to 3.3 is supported

Whoosh
    - install 
    - or ``easy_install Whoosh`` / ``pip install Whoosh``
    - or run ``hg clone http://bitbucket.org/mchaput/whoosh whoosh_src && ln -s whoosh_src/src/whoosh whoosh`` in **src** folder
    - or `Download & uncompress <https://pypi.python.org/pypi/Whoosh/#downloads>`_ it and copy the content of the **src** folder to |nw|'s **src**\ 's folder

.. _QuickRun:

Quick run
=========

This technique is using :mod:`python:wsgiref`, discouraged for production:

.. parsed-literal::
    
   ./run.py |nanoconf|

You can enjoy `the home page on http://127.0.0.1:8080/ <http://127.0.0.1:8080/>`_ in theory ;)

Next step is to read the :doc:`installation` guide or go to the :doc:`developpers` pages.

