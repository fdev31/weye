#!/usr/bin/env python

import sys
import os
import re
from glob import glob
from shutil import copytree, rmtree

def main():
    if len(sys.argv) == 2:
        OUT = open(sys.argv[1], 'w').write
    else:
        OUT = open('mimes.js', 'w').write

    PDIR="../static/mime/"

    def md(*path):
        try:
            os.makedirs( os.path.join(*path) )
        except Exception:
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
        print(' + %s'%name)
        md( PDIR, 'js', name)
        # Display function
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
        # copy & enable stylesheet
        if os.path.isfile( os.path.join(name, 'style.css') ):
            OUT('        ,\n        stylesheet: true')
            open( os.path.join(PDIR, 'js', name, 'style.css'), 'w').write(
                open( os.path.join(name, 'style.css') ).read()
                )
        # declare dependencies
        if os.path.isfile( os.path.join(name, 'dependencies.js') ):
            OUT('        ,\n        dependencies:\n')
            for line in open( os.path.join(name, 'dependencies.js') ):
                OUT('            '+line)
        OUT('\n    }')
        # copy all assets
        if os.path.isdir( os.path.join(name, 'js') ):
            jsdir = os.path.join(PDIR, 'js', name)
            rmtree( jsdir )
            copytree( os.path.join(name, 'js'), os.path.join(jsdir) )
        OUT('\n//  end of %s\n'%name.upper())

    OUT('}\n')
    for line in open('aliases.txt'):
        if line.strip():
            p = tuple(x.strip() for x in line.split(':'))
            OUT('mimes["%s"]=mimes["%s"]\n'%p)
            print(' * %s (=%s)'%p)

if __name__ == '__main__':
    main()

