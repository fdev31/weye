import bottle
from .application import application
import weye.configuration
import logging
log = logging.getLogger('main')
weye.configuration.config.debug = True
log.info('starting application in debug mode, run using "uwsgi --ini uwsgi_conf.ini" to avoid those traces.')
weye.configuration.log.setLevel(logging.NOTSET)

application.catchall = False
bottle.run(application, host='0.0.0.0', reloader=False, debug=True)

