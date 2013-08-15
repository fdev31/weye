"""
###########
Application
###########

.. autofunction:: root_cb

"""
import os
import sys
import bottle
import logging
from bottle import json_dumps as dumps
from bottle import json_loads as loads

from weye.utils import guess_type
from weye.configuration import config, import_conf
from weye.search_engine import search
from weye import root_objects
log = logging.getLogger('application')

# ensure mimes icons are expanded (optimization to avoid huge archives)
_mimes_path1 = os.path.abspath( os.path.join( config.static_root, 'mime') )
sys.path.insert(0, _mimes_path1)
_mimes_path2 = os.path.abspath( os.path.join( config.static_root, os.path.pardir, 'mimes') )
sys.path.insert(0, _mimes_path2)
try:
    mimesjs = os.path.join( config.static_root, 'mimetypes.js')
    if not os.path.exists(mimesjs):
        # mime icons
        from clean_dups import expand
        cwd = os.getcwd()
        os.chdir( _mimes_path1 )
        expand()
        os.chdir(cwd)
        # mime data (.js + css)
        import mime_compiler
        os.chdir( _mimes_path2 )
        mime_compiler.main()
        os.chdir(cwd)
        open(mimesjs, 'w').write(
            open( os.path.join(config.static_root, os.path.pardir, 'mimes', 'mimes.js') ).read()
        )
        # cleanup
        del(sys.path[0], sys.path[1], expand, _mimes_path1, _mimes_path2)
    del(mimesjs)
except Exception as e:
    print("Failed to generate mimes: %r"%e)

__all__ = ['root_cb']

try:
    from urllib.parse import unquote
except ImportError: # python2
    from urllib import unquote

_fix_path = unquote

# INDEX
@bottle.get('/')
def root_cb():
    """ Default route (aka ``/`` or *root* ), displays :file:`static/weye.html` """
    return bottle.static_file('weye.html', config.static_root)


# TODO: search
@bottle.post('/search')
def cb():
    bottle.response.set_header('Content-Type', 'application/json')
    log.debug("search")
    yield '['
    first = True
    # TODO: handle multi-page
    pages, results = search( bottle.request.POST['text'], results=100 )
#    for item in root_objects.search_objects(bottle.request.POST['text'].encode('utf-8')):
    for item in results:
        if not first:
            yield ','
        else:
            first = False
        yield dumps(item)
    yield ']'

@bottle.route('/favicon.ico')
def cb():
    return bottle.static_file('favicon.ico', config.static_root)

@bottle.route('/static/<path:path>')
def cb(path):
    return bottle.static_file(path, config.static_root)

# GET OBJECTS METADATA
@bottle.route('/o/')
@bottle.route('/o/<path:path>')
def cb(path='/'):
    path = _fix_path(path)
    log.debug('~ Accessing %r', path)
    # TODO: session + permission mgmt
    return root_objects.get_object_from_path(path)

# UPDATE OBJECTS METADATA
@bottle.route('/o/<path:path>', method='PUT')
def cb(path='/'):
    path = _fix_path(path)
    log.debug('~ Updating %r', path)
    # TODO: session + permission mgmt
    m = loads(bottle.request.POST['meta'])
    root_objects.update_object(path, m)
    return {}
#    return root_objects.get_object_from_path(path)

# UNLINK AN OBJECT
@bottle.route('/o/<path:path>', method='DELETE')
def cb(path='/'):
    path = _fix_path(path)
    fpath = os.path.join(config.shared_root, path)
    if not config.allow_overwrite and os.path.exists(fpath):
        return {'error': "You are not allowed to overwrite this file"}
    log.debug('~ Deleting %r', path)
    # TODO: session + permission mgmt
    root_objects.delete_object(fpath)
    return {}

# CHILDREN / CONTENT
@bottle.route('/c/')
@bottle.route('/c/<path:path>')
def cb(path='/'):
    path = _fix_path(path)
    log.debug('~ Listing %r', path)
    # TODO: session + permission mgmt
    bottle.response.set_header('Content-Type', 'application/json')
    return dumps( root_objects.list_children(path) )

# DOWNLOAD / RAW DATA
@bottle.route('/d/<path:path>')
def cb(path):
    path = _fix_path(path)
    log.debug('~ Serving raw %r', path)
    return bottle.static_file(path, config.shared_root)

# UPLOAD / RAW DATA
@bottle.route('/d/<path:path>', method='POST')
def cb(path):
    path = _fix_path(path)
    text = bottle.request.POST['text']
    fpath = os.path.join(config.shared_root, path)
    if not config.allow_overwrite and os.path.exists(fpath):
        return {'error': "You are not allowed to overwrite this file"}
    try:
        f = open(fpath, 'w')
        f.write(text)
        f.close()
    except Exception as e:
        ret = {'error': repr(e)}
    else:
        ret = {'ok': True}
    return ret

# UPLOAD FILE / UPDATES AS WELL
@bottle.route('/upload', method='POST')
def cb():
    log.debug('~ Uploading!')
    bottle.response.set_header('Content-Type', 'application/json')
    yield
    prefix = os.path.join(config.shared_root, bottle.request.POST['prefix'].lstrip('/'))
    if prefix[-1] != '/':
        prefix += '/'
    items = []
    errors = []
    for f in bottle.request.files.values():
        fname = prefix+f.filename
        for t, d in root_objects.save_object_to_path(fname, f.file.read):
            if t == 'err':
                errors.append(d)
            elif t == 'new':
                items.append( [d, guess_type(d)] )
            yield
    yield bottle.json_dumps( {'error':errors or False, 'children': {'c':['link', 'mime'], 'r':items} } )


application = bottle.app()

try:
    import uwsgi
    import_conf(uwsgi.opt['weye-conf'])
except ImportError:
    uwsgi = None
