# Nanowork

![logo](http://nanowork.readthedocs.org/en/latest/_static/logo.png)

[Read the documentation](https://nanowork.readthedocs.org/en/latest/)

# WIP

Currently, quite broken: properties edition, many actions...

TODO:
-  make containers concept and build folders/ItemList code from it (see templates.js)
-  implement edit using http://vitalets.github.io/x-editable/ ?

Types (aka elements):
    - text (completable ?)
        - completable
        - url
        - color
        - bool
        - integer (custom validator from list of regex)
        - object url (link) **
    - textarea
    - date
    - tag (#foo) => Shared list accross whole system
    - datetime
    - list (checklist or selection of common types, generator based, server side)
    + data (file)

Compound type:
    + action (link(url) + caption(text) + classes(list of text) + tags (list of tags like #adminonly))

 ** track all links to avoid broken links

    
Pages (aka fullscreen items):
(map:<mime: class>)
    - Item (abstract)
        - mimetype (text)
        - title (text)
        - size (int)
        - owner (object url)
        - members (list of object url)
        - thumbnail (link)
        - creation date (datetime)
    - Member (TODO .app)
        - permissions (text)
    - ThumbnailGenerator (TODO .app)
        - url (url)
        - source (data)
    - SiteAdmin (TODO .app)
        - admins(text)
        - private areas (list -> selection)
        - recent_activity (list of object url)
        - latest_activity (datetime)
        - site title(text)
        - background color (color)
    - File (standard/download only)
        - file(data)
        - comments(list of textarea)
    - EditableText (is a File)
    - ColoredText (is a File)
    - Folder (is a File)
    - Image (is a File)
    - Video (is a File)
    - Sound (is a File)
    - PresentationFolder (is a Folder and .app, TODO)

Server-side global hooks! 

Fancy:
    youtube searches into special Youtube page (topic: virtual items)
    1) allow short urls VS 2) use other param


Pages and Types have:
    - js code
        - hooks
            - add, remove (add used to update types)
        - definitions (object initialization)
    - css
    - view (templates)
    - python code
        - hooks:
            add, remove, update (apply on item and its parent!)
        - custom functions
 
# Structure

type **make all** to generate all files.

## Sources

Look into *src/jscode/* folder for Javascript code (client side) and *src/weye/* for server side code.

## Themes

In lesscss format, found in *themes/* folder, the main file is *default.less*.

## Objects

In case you edit some object code:

In *objects*,  run *compiler.py* to generate mimes.js, then type "**make all**" at the root of the sources.

### insert-mimetype-prefix-here

**aliases.txt**

Own all aliases in the form *<mime>: <folder-name>*

**view.js**

Js code for view. The minimalistic form is **Nano.set_content(this);**.
You may **.appendTo($('#contents'))** as well.

**js/**

Folder containing additional js files that must be loaded.

**definitions.js**

Special file for custom definitions. The file format is a little tricky: indented lines are untouched, but others are prefixed with some magic code, so only use lvalues here !

## Views

You can find page templates in *views* folder.
