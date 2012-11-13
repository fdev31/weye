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

config.static_root = config.static_root.rstrip(os.path.sep) # path for static files
config.shared_root = config.shared_root.rstrip(os.path.sep) # path for shared files
config.shared_db = os.path.join(config.shared_root, '.weye_db') # path for shared files database
config.special_extension = '.weye'
config.exclude_dot_files = True

try:
    os.mkdir(config.shared_db)
except (OSError, IOError):
    pass
