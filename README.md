# Goal

A simple but full-featured file manager using HTML5.

- Should replace HTTP & FTP & Samba on a LAN.
- Simple code base, easy to extend & adapt to specific requirements.


# Running it

    uwsgi --ini uwsgi_conf.ini

or

    python run.py


## Sprint 0 : architecture / prototype

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

- [BootStrap](http://twitter.github.io/bootstrap/)

    To handles most of the HTML5 boilerplate

### Not chosen yet

- Database

    Stored json (in `.weye` files) is the way for the POC, to be changed

- Factory

    The factory pattern is not implemented yet. We may use the standard [mimetypes](http://docs.python.org/2/library/mimetypes.html) module from python.

- UI
    
    The page layout isn't decided yet, same for the possible actions

- Code highlight in previews ? [rainbow](https://github.com/ccampbell/rainbow/)

## Sprint 1 : browseable files

## Sprint 2 : upload

## Sprint 3 : nice mimetype-based factories

## Sprint 4 : Zip download & archive direct browsing

## Sprint 5 : lightweight ACL

## Sprint 6 : custom handlers for custom extensions


# Interesting projects

[Mice](http://craig.is/killing/mice) could handle keyboard shortcuts

# Bugs

- Localized filenames are tested under uwsgi 1.4.9, otherwise it may not work
- SVG not working on some mobiles (can't be fixed, switch to png ?)
