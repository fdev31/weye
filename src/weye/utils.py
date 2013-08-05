import os
import logging
import mimetypes

# TODO: provide own mimetypes file / rely on magic only on fallback

log = logging.getLogger('utils')

try:
    import magic
except Exception as e:
    log.error('libmagic might not be found: %r', e)
    magic = False

MIMES = {}
for line in open(os.path.join(os.path.dirname(__file__), 'mimedata.txt')):
    k, v = line.split(None)
    MIMES[k] = v

def guess_type(fname):
    if os.path.isdir(fname):
        t = 'folder'
    else:
        ext = fname.rsplit('.', 1)[1]
        if '.' in fname and ext in MIMES:
            t = MIMES[ext]
        else:
            if magic:
                with magic.Magic(flags=magic.MAGIC_MIME_TYPE) as m:
                    t = m.id_filename(fname)
            else:
                t = (mimetypes.guess_type(fname)[0] or "application-octet-stream")

            t = t.replace('/', '-')
            if t.startswith('video'): # We are poor in video icons, later: thumbnails ?
                t = 'video'

    log.debug('Type for %r is %r', fname, t)
    return t

