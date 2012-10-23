# mimetypes

import mimetypes
mimetypes.add_type('woff', 'application-x-font-woff')

# logging

import logging

logging.basicConfig()
log = logging.getLogger()
log.setLevel(logging.WARNING)

# config

class Config(object): pass

config = Config()

# set the defaults
config.debug = False
config.static_root = 'static'
