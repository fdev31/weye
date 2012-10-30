import os
from bottle import json_dumps as dumps
from bottle import json_loads as loads
from .configuration import config
import mimetypes
import logging

log = logging.getLogger('root_objects')
try: # backward compat for python2.x
    FileNotFoundError
except NameError:
    FileNotFoundError = None
    PermissionError = None

mimetypes.init()

def guess_type(fname):
    return mimetypes.types_map.get('.'+fname.rsplit('.', 1)[-1], '') or "application/octet-stream"

def get_object_from_path(path):
    path = path.rstrip('/').lstrip('/')
    fpath = os.path.join(config.shared_root, path).rstrip('/')
    meta_fpath = fpath + config.special_extension
    up_to_date = False
    infos = None

    try:
        infos = loads(open(meta_fpath, 'rb').read())
        up_to_date = True
    except (OSError, IOError, FileNotFoundError):
        if not os.path.exists(fpath):
            return {'error': True, 'message': 'File not found', 'link': path} # or "choices" + "default", instead of link
        else:
            file_type = 'folder' if os.path.isdir(fpath) else guess_type(fpath)

    # read infos (TODO later: in the database)
    st = os.stat(fpath)
    if not infos:
        infos = {'id': "%x-%x"%(st.st_ctime, st.st_ino),
                'name': os.path.basename(fpath),
                'path': path,
                'description': u'',
                'type': file_type}
    if not up_to_date:
        try:
            open(meta_fpath, 'wb').write(dumps(infos).encode())
        except (OSError, IOError, PermissionError) as e:
            log.error('Unable to save metadata as %r: %r', meta_fpath, e)
    return infos


def list_children(path):
    path = path.rstrip('/').lstrip('/')
    fpath = os.path.join(config.shared_root, path).rstrip('/')
    def test(p):
        return os.access(os.path.join(fpath, p), os.R_OK)
    return tuple({'m': guess_type(f), 'f': f} for f in os.listdir(fpath) if f[0] != '.' and not f.endswith(config.special_extension) and test(f))

