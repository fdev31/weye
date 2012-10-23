import os
from bottle import json_dumps as dumps
from bottle import json_loads as loads
from .configuration import config
import mimetypes
import logging

log = logging.getLogger('root_objects')

def get_object_from_path(path):
    log.warning('PATH %r'%path)
    fpath = os.path.join(config.static_root, path)
    meta_fpath = fpath + '.weye'
    up_to_date = False

    try:
        infos = loads(open(meta_fpath, 'rb').read())
        up_to_date = True
    except (OSError, IOError):
        if os.path.exists(fpath):
            file_type = 'folder' if os.path.isdir(fpath) else mimetypes.guess_type(fpath)
        else:
            return {'error': True, 'message': 'File not found', 'link': '/'} # or "choices" + "default", instead of link

        # read infos (TODO later: in the database)
        st = os.stat(fpath)
        infos = {'id': "%x-%x"%(st.st_ctime, st.st_ino), 'name': fpath.rsplit('/', 1)[-1], 'description': u''}
        if not up_to_date:
            open(meta_fpath, 'wb').write(dumps(infos))

