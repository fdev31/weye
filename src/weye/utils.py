import os
import logging
import mimetypes

log = logging.getLogger('utils')

try:
    import magic
except Exception as e:
    log.error('libmagic might not be found: %r', e)
    magic = False

def guess_type(fname):
    if os.path.isdir(fname):
        t = 'folder'
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
