import os
import bottle
import logging
from bottle import json_dumps as dumps
from bottle import json_loads as loads

from .utils import guess_type
from .configuration import config
from . import root_objects
log = logging.getLogger('application')

@bottle.route('/')
def cb():
    return bottle.static_file('weye.html', config.static_root)

@bottle.route('/favicon.ico')
def cb():
    return bottle.static_file('favicon.ico', config.static_root)

@bottle.route('/static/<path:path>')
def cb(path):
    return bottle.static_file(path, config.static_root)

@bottle.route('/Kickstrap/<path:path>')
def cb(path):
    return bottle.static_file(os.path.join('Kickstrap', path), config.static_root)

# OBJECTS

@bottle.route('/o/')
@bottle.route('/o/<path:path>')
def cb(path='/'):
    log.debug('~ Accessing %r', path)
    # TODO: session + permission mgmt
    obj = root_objects.get_object_from_path(path)
    if bottle.request.is_xhr:
        return obj # dumps object
    bottle.redirect('/?view='+path)

# CHILDREN
@bottle.route('/c/')
@bottle.route('/c/<path:path>')
def cb(path='/'):
    log.debug('~ Listing %r', path)
    # TODO: session + permission mgmt
    bottle.response.set_header('Content-Type', 'application/json')
    obj = root_objects.list_children(path)
    if bottle.request.is_xhr:
        log.debug(obj)
        return dumps(obj)
    bottle.redirect('/')

# DOWNLOAD
@bottle.route('/d/<path:path>')
def cb(path):
    log.debug('~ Serving raw %r', path)
    return bottle.static_file(path, config.shared_root)

# UPLOAD
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

