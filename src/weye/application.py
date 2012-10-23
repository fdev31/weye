from .configuration import config
import bottle
import root_objects
import logging
log = logging.getLogger('application')

@bottle.route('/')
def cb():
#    return 'Coing'
    return bottle.static_file('weye.html', config.static_root)

@bottle.route('/static/<path:path>')
def cb(path):
    # TODO: session + permission mgmt
    obj = root_objects.get_object_from_path(path)
    if bottle.is_ajax:
        return obj # dumps object
    return 'rdr to /'

    return bottle.static_file(path, config.static_root)

@bottle.route('</path:path>/<action:re:[a-z]+>')
def cb(path, action):
    return 'Action %r called on %r'%(path, action)

@bottle.route('<path:path>')
def cb(path):
    log.debug('~ Accessing %r'%path)
    return 'Viewing %r'%path

application = bottle.app()
