# Goal

A simple but full-featured file manager using HTML5.

- Should replace HTTP & FTP & Samba on a LAN.
- Simple code base, easy to extend & adapt to specific requirements.


# Running it

    uwsgi --ini uwsgi_conf.ini

or

    python run.py


## Sprint 0 : architecture

### Current choices

- Compatibility

    - WSGI for the web ([bottle](http://bottlepy.org/docs/dev/) just looks fine)
    - Compatible with python >= 2.6 (or 2.5 ?)
    - Should be tested with [uWSGI](http://projects.unbit.it/uwsgi/) for the "production" mode
    - Should be tested with (pick one):
        - wsgiref
        - paste
        - waitress

- [ICanHaz](http://icanhazjs.com/)

    To render HTML ([mustache](http://mustache.github.com/mustache.5.html)-powered templates)

- [KickStrap](http://getkickstrap.com/docs/1.1/first-steps/)

    To handles all the HTML5 boilerplate

### Not chosed yet

- Database

    Stored json (in `.weye` files) is the way for the POC, to be changed

- Factory

    The factory pattern is not implemented yet. We may use the standard [mimetypes](http://docs.python.org/2/library/mimetypes.html) module from python.

- UI
    
    The page layout isn't decided yet, same for the possible actions

## Sprint 1 : browseable files

## Sprint 2 : upload

## Sprint 3 : nice mimetype-based factories

## Sprint 4 : lightweight ACL

## Sprint 5 : custom handlers for custom extensions


# Interesting projects

[Mice](http://craig.is/killing/mice) could handle keyboard shortcuts

[Isotope](http://isotope.metafizzy.co/index.html) to display things in a nice way instead of a plain list

[EpicEditor](http://oscargodson.github.com/EpicEditor/) looks very nice to edit text & markdown documents