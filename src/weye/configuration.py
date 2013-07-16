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
config.special_extension = '.weye'
config.exclude_dot_files = True
config.host = '0.0.0.0'
config.port = '8080'
config.file_encoding = 'utf-8'

# behavior
config.no_overwrite = os.environ.get('ALLOW_WRITE', '').upper() not in ('1', 'YES', 'TRUE', 'ON')


_parser = configparser.ConfigParser()

def import_conf(filename=None):
    try:
        _import_conf(filename)
    except Exception as e:
        print('[EE] Failed to load configuration: %s'% e)

def _import_conf(filename=None):
    root_changed = False
    if filename:
        _parser.read(filename)
        from functools import partial
        rd = partial(_parser.get, 'general')
        if rd('shared'):
            config.shared_root = rd('shared')
            root_changed = True
        if rd('port'):
           config.port = int(rd('port'))
        if rd('host'):
            config.host = rd('host')
        if rd('file_encoding'):
            config.file_encoding = rd('file_encoding')
        config.debug = (rd('debug') or ' ')[0].lower() in 'yta'
        config.no_overwrite = (rd('write') or ' ')[0].lower() not in 'yta'
        if rd('home'):
            os.chdir(rd('home'))

    if root_changed or not filename:
        config.shared_root = config.shared_root.rstrip(os.path.sep) # path for shared files
        config.shared_db = os.path.join(config.shared_root, '.weye_db') # path for shared files database

        try:
            os.mkdir(config.shared_db)
        except (OSError, IOError):
            pass

import_conf()
