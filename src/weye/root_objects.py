"""
############
Root objects
############

.. autofunction:: get_object_from_path

.. autofunction:: list_children
"""
__all__ = ['get_object_from_path']
import os
import sys
from bottle import json_dumps as dumps
from bottle import json_loads as loads
import itertools
from .utils import guess_type
from .configuration import config
from .search_engine import ObjAdder
import logging

log = logging.getLogger('root_objects')

if sys.version_info[:2] < (3,3):
    FileNotFoundError = IOError
    PermissionError = IOError
    FileExistsError = IOError

def add_new_object(content, type=None, filename=None):
    """
    content: body (str)
    type: unused
    filename: filename (if None, it's automatic)
    """
    if not filename:
        c = itertools.count()
        while True:
            filename = os.path.join(config.shared_root, 'weyefile_%d.txt'%next(c))
            if not os.path.exists(filename):
                break
    else:
        filename = os.path.join(config.shared_root, filename)

    name = filename.rsplit('/', 1)[-1]

    with ObjAdder() as add:
        add(path=name, tags='text note', txtcontent=content.decode('utf-8'), mime='text-plain', description='')
    open(filename, 'wb').write(content)
    log.info("Created %r", filename)
    return name

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

def update_object(path, meta):
    path = path.rstrip('/').lstrip('/')
    meta_fpath = os.path.join(config.shared_db, path).rstrip('/') + config.special_extension

    infos = loads(open(meta_fpath, 'rb').read())
    infos.update(meta)
    open(meta_fpath, 'wb').write(dumps(infos).encode())

def get_object_from_path(path):
    """
    returns metadata for an item from its path.

    List of supported metadata:

        - id
        - size
        - name
        - descr
        - mime

    :arg path: the path of the item
    :type path: str


    """
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
    if not infos:
        st = os.stat(fpath)
        if '/' in path:
            name = path.rsplit('/', 1)[1]
        else:
            name = path
        infos = {'id': st.st_ino,
                'size': st.st_size,
                'name': name,
                'descr': '',
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


def _safe_mime(path):
    try:
        return get_object_from_path(path)['mime']
    except KeyError:
        return guess_type(path)

def list_children(path):
    """ Returns a sorted list of children in :ref:`compact form <compact_form>` for the given path

    Only returns ultra minimalistic metadata set:

        - name
        - mime

    :arg path: the path of the folder
    :type path: str

    Format:

    .. code-block:: js

        {children: {'c': ['name', 'mime'], 'r': values}}
    """
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

    values = [ [f, _safe_mime(os.path.join(fpath, f))]
            for f in os.listdir(fpath) if is_listable(f)]
    values.sort(key=lambda o: '!!!'+o[0]+o[1] if o[1] == 'folder' else o[0]+o[1])
    return {'children': {'c': ['name', 'mime'], 'r': values} }

