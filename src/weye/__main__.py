import bottle
from .application import application
import weye.configuration
import sys
import logging
log = logging.getLogger('main')
weye.configuration.config.debug = True
log.info('starting application in debug mode, run using "uwsgi --ini uwsgi_conf.ini" to avoid those traces.')
weye.configuration.log.setLevel(logging.NOTSET)

def helpanddie():
    print("Syntax: %s [configuration file]"%sys.argv[0])
    raise SystemExit(1)

if '-h' in sys.argv or '--help' in sys.argv:
    helpanddie()
if len(sys.argv) == 2:
    weye.configuration.import_conf(sys.argv[1])
else:
    helpanddie()

application.catchall = False
bottle.run(application,
        host=weye.configuration.config.host or '0.0.0.0',
        reloader=False,
        debug=weye.configuration.config.debug,
        port=weye.configuration.config.port or 8080)

