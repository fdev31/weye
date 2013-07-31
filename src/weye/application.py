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

try:
    from urllib.parse import unquote
except ImportError: # python2
    from urllib import unquote

_fix_path = unquote

# INDEX
@bottle.get('/')
def cb():
    return bottle.static_file('weye.html', config.static_root)

import subprocess
cwd = os.getcwd()
os.chdir( os.path.join( config.static_root, 'mime') )
subprocess.call([sys.executable, 'clean_dups.py', 'expand'])
os.chdir(cwd)

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
    if config.no_overwrite and os.path.exists(fpath):
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

# PUSH / Add a note (text)
# TODO: add filename support (read from search box)
#@bottle.post('/push')
#def cb():
#    bottle.response.set_header('Content-Type', 'application/json')
#    log.debug("add")
#    fname = root_objects.add_new_object(bottle.request.POST['text'].encode('utf-8'))
#    return '{"href": %s}'%dumps('/o/'+fname)

# UPLOAD FILE / alias / ADD ONLY
# TODO: add versionning support (+ allow overwriting)
@bottle.route('/upload', method='POST')
def cb():
    log.debug('~ Uploading!')
    bottle.response.set_header('Content-Type', 'application/json')
    prefix = os.path.join(config.shared_root, bottle.request.POST['prefix'].lstrip('/'))
    if prefix[-1] != '/':
        prefix += '/'
    items = []
    errors = []
    for f in bottle.request.files.values():
        fname = prefix+f.filename
        ok = False
        for x in root_objects.save_object_to_path(fname, f.file.read):
            if x and x is not True:
                errors.append(x)
            else:
                ok = True
            yield
        if ok:
            items.append({'f':f.filename, 'm':guess_type(fname)})
    yield bottle.json_dumps( {'error':errors or False, 'child': items} )


application = bottle.app()

try:
    import uwsgi
    import_conf(uwsgi.opt['weye-conf'])
except ImportError:
    uwsgi = None

