#!/usr/bin/env python

mime_ext = {}
ext_mime = {}

def add(mime, ext):
    # Special simplification heuristics here
    if mime.startswith('video'):
        mime = 'video'
    # /heuristics
    if mime not in mime_ext:
        mime_ext[mime] = []
    mime_ext[mime].append(ext)
    if ext not in ext_mime:
        ext_mime[ext] = []
    ext_mime[ext].append(mime)

for line in open('/etc/mime.types'):
    items = line.strip().split(None)
    if len(items) > 1:
        for ext in items[1:]:
            add(items[0], ext)

for ext, mimes in ext_mime.items():
    if len(mimes) > 1:
        mimes.sort(key = lambda a: len(a))
    print("%s %s"%(ext, mimes[0].replace('/', '-')))


