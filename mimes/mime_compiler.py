#!/usr/bin/env python

import sys
import os
import re
from glob import glob
from shutil import copytree, rmtree

def duplicate(p1, p2):
    p1 = os.path.abspath(p1)
    p2 = os.path.abspath(p2)
    open(p2, 'w+').write(open(p1).read())

def main():
    if len(sys.argv) == 2:
        OUT = open(sys.argv[1], 'w+').write
    else:
        OUT = open('mimes.js', 'w+').write

    PDIR="../static/mime/"

    def md(*path):
        try:
            os.makedirs( os.path.join(*path) )
        except (Exception, FileExistsError):
            pass

    md(PDIR, 'js')

    OUT('mimes = {\n')
    first = True

    display_re = re.compile('^ *function +display')

    print('Installed mime types:')
    for n in sorted(glob('*/view.js')):
        if first:
            first = False
        else:
            OUT('    ,\n')
        name = os.path.dirname(n)
        base_jsdir = os.path.join(PDIR, 'js')
        jsdir = os.path.join(base_jsdir, name)
        if os.path.isdir(jsdir ):
            rmtree( jsdir )
        print(' + %s'%name)
        # Display function
        print("\t- view")
        OUT('    "%s": {\n        display:'%name)
        for line in open(n):
            if not line.strip():
                continue
            if display_re.match(line):
                OUT(' function %s' %( line[line.index('('):] ) )
            else:
                if line.startswith('};'):
                    line = '}' + line[2:]
                OUT('        ' + line)
        OUT('        ,\n        name: "%s"'%name)
        # copy all assets
        if os.path.isdir( os.path.join(name, 'js') ):
            p1 = os.path.join(name, 'js')
            print("\t- js/*.* assets (%s -> %s)"%(p1, jsdir))
            copytree(p1, jsdir)
        if os.path.exists( os.path.join(name, 'style.css') ):
            print("\t- style.css")
            OUT('        ,\n        stylesheet: true\n')
            duplicate( os.path.join(name, 'style.css') , os.path.join(jsdir, 'style.css'))
        # declare dependencies
        if os.path.isfile( os.path.join(name, 'dependencies.js') ):
            print("\t- dependencies")
            OUT('        ,\n        dependencies:\n')
            for line in open( os.path.join(name, 'dependencies.js') ):
                OUT('            '+line)
        OUT('\n    }')
        OUT('\n//  end of %s\n'%name.upper())

    OUT('}\n')
    for line in open('aliases.txt'):
        if line.strip():
            p = tuple(x.strip() for x in line.split(':'))
            OUT('mimes["%s"]=mimes["%s"];\n'%p)
            print(' * %s (=%s)'%p)

if __name__ == '__main__':
    main()

