#!/usr/bin/env python

from hashlib import sha1
import json
import sys
import os

force_expand = force_cleanup = False
if 'expand' in sys.argv:
    force_expand = True
elif 'cleanup' in sys.argv:
    force_cleanup = True

if 'help' in sys.argv or '-help' in sys.argv or '--help' in sys.argv:
    print("Syntax: %s [expand|cleanup]"%sys.argv[0])
    raise SystemExit(0)

all_files = []
for fname in os.listdir(os.path.curdir):
    if not fname.endswith('.svg'):
        continue
    else:
        h = sha1(open(fname).read().encode('latin1')).hexdigest()
        all_files.append(
            (h, fname)
        )
all_files.sort()
duplicates = {}
last_hash = None
for finfo in all_files:
    if finfo[0] != last_hash:
        cur_dups = [finfo[1]]
        last_hash = finfo[0]
        duplicates[last_hash] = cur_dups
    else:
        cur_dups.append(finfo[1])

cleaned_duplicates = []

for dups in duplicates:
    if len(duplicates[dups]) <= 1:
        continue
    cleaned_duplicates.append( duplicates[dups] )

def expand():
    # copy dups
    original_duplicates = json.load(open('duplicates.txt'))
    print("Expanding duplicates...")
    for dups in original_duplicates:
        master = open(dups[0]).read()
        for fname in dups[1:]:
            if not os.path.exists(fname):
                open(fname, 'w').write(master)

def cleanup():
    print('Saving informations & removing dups...')
    cleaned_duplicates.sort()
    json.dump(cleaned_duplicates, open('duplicates.txt', 'w'))
    for dups in cleaned_duplicates:
        for fname in dups[1:]:
            os.unlink(fname)

if __name__ == '__main__':
    if force_expand or (not force_cleanup and len(cleaned_duplicates) == 0):
        expand()
    else:
        cleanup()

