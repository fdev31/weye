"""
############
Root objects
############

Read an object's metadata
#########################

.. autofunction:: get_object_from_path

Update an object's metadata
###########################

.. autofunction:: update_object

List object's children
######################

.. autofunction:: list_children

Add new object
##############

.. autofunction:: save_object_to_path

"""

# TODO: init some backend from the  `database` string
# and then use it for further operations

__all__ = ['get_object_from_path']

import os
import sys
import time
from bottle import json_dumps as dumps
from bottle import json_loads as loads
import shutil
import itertools
from .utils import guess_type
from .configuration import config
import logging

log = logging.getLogger('root_objects')

if sys.version_info[:2] < (3,3):
    FileNotFoundError = IOError
    PermissionError = IOError
    FileExistsError = IOError

def delete_object(path):
    if os.path.isdir(path):
        shutil.rmtree(path)
    else:
        os.unlink(path)
    os.unlink( os.path.join(config.shared_db, path) + config.special_extension )

def save_object_to_path(path, read_func):
    """ Saves an object, providing a read function

    :arg path str: the file path
    :arg read_func callable: a function that takes an integer (number of bytes to read)
    """
#    print('SAVE %s'%(path))
    can_write = True

    path = path.rstrip('/').lstrip('/')

    if os.path.exists(path):
        if not config.allow_overwrite:
            can_write = False
            yield ('err', 'File "%s" exists!'%os.path.basename(path))
        else:
            base, ext = os.path.splitext(path)
            bkp = '%s-old-%s.%s'%(base, time.asctime(), ext)
            yield ('new', os.path.basename(bkp))
            os.rename(path, bkp)
            try:
                os.unlink( os.path.join(config.shared_db, path) + config.special_extension )
            except Exception as e:
                log.warning('EE: %s'%e)
    else:
        yield ('new', os.path.basename(path))
    if can_write:
        cs = 2**20
        o = open(path, 'wb')
        out = o.write
        while True:
            d = read_func(cs)
            if not d:
                o.close()
                yield (True, True)
                break
            out( d )
            yield (True, True)

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
#    print('GET %s'%(path))
    # TODO: pure metadata reading // a metadata injector will act asychronously
    path = path.rstrip('/').lstrip('/')
    fpath = os.path.join(config.shared_root, path).rstrip('/')
    meta_fpath = os.path.join(config.shared_db, path).rstrip('/') + config.special_extension
    infos = None

    try:
#        print('load %s'%meta_fpath)
        infos = loads(open(meta_fpath, 'rb').read())
    except (OSError, IOError, FileNotFoundError):
        if not os.path.exists(fpath):
            return {'error': True, 'message': 'File not found', 'link': path} # or "choices" + "default", instead of link
        else:
            file_type = guess_type(fpath)

    # We have to create an item, we don't have infos yet !
    if not infos:
        st = os.stat(fpath)
        if '/' in path:
            name = path.rsplit('/', 1)[1]
        else:
            name = path
        infos = {'size': st.st_size,
                'link': name,
                 'title': (name.rsplit('.', 1)[0] if '.' else name).replace('-', ' ').replace('_', ' ').strip().title(),
                'descr': '',
                'mime': file_type}

        # create parent directory
        parent = os.path.dirname( meta_fpath )
        if not os.path.exists( parent ):
            try:
                os.makedirs( parent )
            except (OSError, FileExistsError):
                pass

        # save it
        if path: # do not save root
            try:
                open(meta_fpath, 'wb').write(dumps(infos).encode())
            except (OSError, IOError, PermissionError) as e:
                log.error('Unable to save metadata as %r: %r', meta_fpath, e)

    return infos

def list_children(path):
    """ Returns a sorted list of children in :ref:`compact form <compact_form>` for the given path

    Only returns ultra minimalistic metadata set:

        - link *(real name/id)*
        - title
        - descr
        - mime

    :arg path: the path of the folder
    :type path: str

    Format:

    .. code-block:: js

        {children: {'c': ['descr', 'mime', 'link', 'title'], 'r': values}}
    """
#    print('LIST %s'%(path))
    # TODO: do not test files physically but return a database call
    path = path.rstrip('/').lstrip('/')
    fpath = os.path.join(config.shared_root, path).rstrip('/')

    def is_listable(f):
        full_path = os.path.join(fpath, f)
        if f[0] == '.' and config.exclude_dot_files:
            return False
        if f.endswith(config.special_extension):
            return False
        if not os.access(full_path, os.R_OK):
            return False
        return full_path

    values = []
    fields = ('link', 'title', 'descr', 'mime')
    for f in os.listdir(fpath):
        cfp = is_listable(f)
        if cfp:
            cfp = os.path.join(path, f)
            o = get_object_from_path(cfp)
            values.append( [ o[k] for k in fields ] )
    return {'children': {'c': fields, 'r': values} }

