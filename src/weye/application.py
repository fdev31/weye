import os
import bottle
import logging
from .configuration import config
from . import root_objects
log = logging.getLogger('application')

@bottle.route('/')
def cb():
    return bottle.static_file('weye.html', config.static_root)

@bottle.route('</path:path>/<action:re:[a-z]+>')
def cb(path, action):
    return 'Action %r called on %r'%(path, action)

@bottle.route('/static/<path:path>')
def cb(path):
    return bottle.static_file(path, config.static_root)

@bottle.route('/Kickstrap/<path:path>')
def cb(path):
    return bottle.static_file(os.path.join('Kickstrap', path), config.static_root)

@bottle.route('/o/<path:path>')
def cb(path):
    log.debug('~ Accessing %r'%path)
    # TODO: session + permission mgmt
    obj = root_objects.get_object_from_path(path)
    if bottle.request.is_xhr:
        return obj # dumps object
    bottle.redirect('/?view='+path)
#    return 'Viewing %r'%path



application = bottle.app()
