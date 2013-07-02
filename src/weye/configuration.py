import os
import logging
import mimetypes

try:
    import configparser # py3k
except ImportError:
    import ConfigParser as configparser

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
config.shared_root = os.environ.get('ROOT', '/tmp/')
config.debug = int(os.environ.get('DEBUG', 0)) != 0

config.static_root = config.static_root.rstrip(os.path.sep) # path for static files
config.shared_db = os.path.join(config.shared_root, '.weye_db') # path for shared files database
config.special_extension = '.weye'
config.exclude_dot_files = True
config.host = '0.0.0.0'
config.port = '8080'

# behavior
config.no_overwrite = os.environ.get('ALLOW_WRITE', '').upper() not in ('1', 'YES', 'TRUE', 'ON')

try:
    os.mkdir(config.shared_db)
except (OSError, IOError):
    pass

_parser = configparser.ConfigParser()

def import_conf(filename=None):
    if filename:
        _parser.read(filename)
        from functools import partial
        rd = partial(_parser.get, 'general')
        config.shared_root = rd('shared')
        config.port = int(rd('port'))
        config.host = rd('host')
        config.debug = (rd('debug') or ' ')[0].lower() in 'yta'
        if rd('home'):
            os.chdir(rd('home'))
    config.shared_root = config.shared_root.rstrip(os.path.sep) # path for shared files

import_conf()
