import os
import logging
import mimetypes

# mimetypes

mimetypes.add_type('application-x-font-woff', '.woff')
mimetypes.add_type('text-x-lua', '.lua')

# logging


logging.basicConfig()
log = logging.getLogger()
log.setLevel(logging.WARNING)

# config

class Config(object): pass

config = Config()

# set the defaults
config.static_root = 'static'
config.shared_root = '/tmp/'
config.debug = int(os.environ.get('DEBUG', 0)) != 0

config.shared_root = config.shared_root.rstrip(os.path.sep)
config.static_root = config.static_root.rstrip(os.path.sep)
config.special_extension = '.weye'
