# Nanowork

![logo](http://nanowork.readthedocs.org/en/latest/_static/logo.png)

[Read the documentation](https://nanowork.readthedocs.org/en/latest/)

# WIP

Currently, quite broken: properties edition, many actions...

TODO: make containers concept and build folders/ItemList code from it (see templates.js)

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

