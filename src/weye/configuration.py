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
config.check_security = True
config.read_only = False

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
        log.debug('reading %s'%filename)
        _parser.read(filename)

        from functools import partial
        def rd(k):
            try:
                return _parser.get('general', k)
            except Exception as e:
                print("%s: %s"%(filename, e))

        bool_values = 'check_security read_only exclude_dot_files'.split()

        for k in 'port host file_encoding debug shared_root'.split():
            val = rd(k)
            if val:
                if val == 'shared_root':
                    root_changed = True
                elif val.isdigit():
                    val = int(val)

                if k == 'home':
                    os.chdir(val)
                else:
                    setattr(config, k, val)

        for k in bool_values:
            val = rd(k)
            if val:
                setattr(config, k, val[0] in 'yta' if val else False)

    if root_changed or not filename:
        config.shared_root = config.shared_root.rstrip(os.path.sep) # path for shared files
        config.shared_db = os.path.join(config.shared_root, '.weye_db') # path for shared files database

        try:
            os.mkdir(config.shared_db)
        except (OSError, IOError):
            pass

import_conf()
