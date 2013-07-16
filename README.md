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

# TODO/refactoring

## Introduce concept of *family*

Convert "natural" mode to family sort, this is alphabetically sorted inside a family name.

We may propose a list of "standard" prefixes to have high-priority families (like folders, as "!folders" for instance).

## Chose good names

Panel with download & actions:
>  Action panel ?

Top panel with sort & filter
> View panel ?

Main container
> Main container ;)

Item Actions (list of)
> Actions (TBD, merge concept with *Action panel*)

## Make it modular

Split into:

- **index** (Whoosh by default)
- **storage** (vcs by default, may provide unversioned "flat" file backend support)
- **applications**
    - admin (TODO)
    - filemanager (WIP)
    - photo gallery
    
  _TODO_: fix concept of application/setup:
   - mountpoint (server side)
   - mimes/family hooks (client side)
   - specific templates/js/css


- **mimes**
    - applications dedicated to a mime type
        - actions
        - view(s)
- **skin** (or is this specific per app ??)
    - css
    - images (may inherit some)
    - templates
- **installer**
    Will prompt for choice against all the options to generate a configuration file.
    Will bring:
    - run (python file)
    - uwsgi.ini
    - configuration.ini
    - README.txt

