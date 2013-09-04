#!/usr/bin/env python

import sys
import os
import re
from glob import glob
from shutil import copytree, rmtree

try:
    FileExistsError
except NameError:
    FileExistsError = OSError

def duplicate(p1, p2):
    p1 = os.path.abspath(p1)
    p2 = os.path.abspath(p2)
    open(p2, 'w').write(open(p1).read())

def main():
    if len(sys.argv) == 2:
        OUT = open(sys.argv[1], 'w').write
    else:
        OUT = open('mimes.js', 'w').write

    PDIR="../static/mime/"

    def md(*path):
        try:
            os.makedirs( os.path.join(*path) )
        except (Exception, FileExistsError):
            pass

    md(PDIR, 'js')

#    OUT('mimes = {\n')
#    first = True

#    display_re = re.compile('^ *function +display')

    print('Installed mime types:')
    for n in sorted(glob('*/view.js')):
        name = os.path.dirname(n)
        title = name.title().replace('-', '_')
        print(' * %s'%name)
#        if first:
#            first = False
#        else:
#            OUT('    ,\n')
        OUT('''// #############################
// ###### %(t)s's class

function %(t)s (dict) { Item.call(this, dict) }; inherits(%(t)s, Item);

%(t)s.prototype.type = "%(n)s";

%(t)s.prototype.post_view_callback = function() {
    Item.prototype.post_view_callback.call(this);
%(c)s};
'''%dict(
                n=name,
                t=title,
                c=''.join('    '+l for l in open(n)),
            ))
        base_jsdir = os.path.join(PDIR, 'js')
        jsdir = os.path.join(base_jsdir, name)
        if os.path.isdir(jsdir ):
            rmtree( jsdir )
        # Display function
        # copy all assets
        if os.path.isdir( os.path.join(name, 'js') ):
            p1 = os.path.join(name, 'js')
            print("\t- js/*.* assets (%s -> %s)"%(p1, jsdir))
            copytree(p1, jsdir)
        if os.path.exists( os.path.join(name, 'definitions.js') ):
            print("\t- definitions")
            for line in open( os.path.join(name, 'definitions.js') ):
                if line.strip():
                    if line[0] in ' \t':
                        OUT(line)
                    else:
                        OUT('%s.prototype.%s'%(title, line));
        if os.path.exists( os.path.join(name, 'style.css') ):
            print("\t- style.css")
            OUT('%s.prototype.stylesheet = true;\n'%title);
            duplicate( os.path.join(name, 'style.css') , os.path.join(jsdir, 'style.css'))
        # declare dependencies
        if os.path.isfile( os.path.join(name, 'dependencies.js') ):
            print("\t- dependencies")
            OUT('%s.prototype.dependencies =\n'%title);
            for line in open( os.path.join(name, 'dependencies.js') ):
                OUT('            '+line)
        OUT('\nNano.register_mime("%s", %s);\n\n'%(name, title))

    for line in open('aliases.txt'):
        if line.strip():
            p = tuple(x.strip() for x in line.split(':'))
            OUT('Nano.register_mime("%s", Nano.mimes["%s"]);\n'%p)
            print(' * %s (=%s)'%p)

if __name__ == '__main__':
    main()

