import os
from bottle import json_dumps as dumps
from bottle import json_loads as loads
from .utils import guess_type
from .configuration import config
import logging

log = logging.getLogger('root_objects')

try: # backward compat for python2.x
    FileNotFoundError
except NameError:
    FileNotFoundError = None
    PermissionError = None
    FileExistsError = None

def save_object_to_path(path, read_func):
    if os.path.exists(path):
        yield 'File exists!'
    else:
        cs = 2**20
        o = open(path, 'wb')
        out = o.write
        while True:
            d = read_func(cs)
            if not d:
                o.close()
                yield True
                break
            out( d )
            yield


def get_object_from_path(path):
    path = path.rstrip('/').lstrip('/')
    fpath = os.path.join(config.shared_root, path).rstrip('/')
    meta_fpath = os.path.join(config.shared_db, path).rstrip('/') + config.special_extension
    up_to_date = False
    infos = None

    try:
        infos = loads(open(meta_fpath, 'rb').read())
        up_to_date = True
    except (OSError, IOError, FileNotFoundError):
        if not os.path.exists(fpath):
            return {'error': True, 'message': 'File not found', 'link': path} # or "choices" + "default", instead of link
        else:
            file_type = guess_type(fpath)

    # read infos (TODO later: in the database)
    st = os.stat(fpath)
    if not infos:
        infos = {'id': "%x-%x"%(st.st_ctime, st.st_ino),
                'name': os.path.basename(fpath),
                'path': path,
                'description': u'',
                'mime': file_type}
    if not up_to_date:
        if not os.path.exists(meta_fpath):
            try:
                os.makedirs( os.path.dirname( meta_fpath ) )
            except (OSError, FileExistsError):
                pass

        try:
            open(meta_fpath, 'wb').write(dumps(infos).encode())
        except (OSError, IOError, PermissionError) as e:
            log.error('Unable to save metadata as %r: %r', meta_fpath, e)
    return infos


def list_children(path):
    path = path.rstrip('/').lstrip('/')
    fpath = os.path.join(config.shared_root, path).rstrip('/')
    def is_listable(f):
        if f[0] == '.' and config.exclude_dot_files:
            return False
        if f.endswith(config.special_extension):
            return False
        if not os.access(os.path.join(fpath, f), os.R_OK):
            return False
        return True
    l = list({'m': guess_type(os.path.join(fpath, f)), 'f': f}
            for f in os.listdir(fpath) if is_listable(f))

    def s(o):
        return '!!!'+o['f']+o['m'] if o['m'] == 'folder' else o['f']+o['m']
    l.sort(key=s)
    return l

