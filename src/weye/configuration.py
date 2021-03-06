import os
import logging
import mimetypes

try:
    import configparser # py3k
    unicode = str
    print("[Using Python3]")
except ImportError:
    import ConfigParser as configparser
    print("[Using Python2]")

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
config.blacklisted_extensions = ('pyo','pyc')

# behavior
config.allow_overwrite = os.environ.get('ALLOW_WRITE', '').upper() in ('1', 'YES', 'TRUE', 'ON')


_parser = configparser.ConfigParser()

def import_conf(filename=None):
    try:
        _import_conf(filename)
    except Exception as e:
        print('[EE] Failed to load configuration: %s'% e)

def _import_conf(filename=None, encoding=None):
    root_changed = False
    if filename:
        log.debug('reading %s'%filename)
        _parser.read(
            filename.decode(encoding or config.file_encoding)
            if not isinstance(filename, (str, unicode))
            else filename
        )

        from functools import partial
        def rd(k):
            try:
                return _parser.get('general', k)
            except Exception as e:
                print("warning %s: %s"%(filename, e))


        for k in 'file_encoding debug shared_root'.split():
            val = rd(k)
            if val:
                if val == 'shared_root':
                    root_changed = True
                elif val.isdigit():
                    val = int(val)

                if k == 'chdir':
                    os.chdir(val)
                else:
                    setattr(config, k, val)

        bool_values = 'check_security allow_overwrite read_only exclude_dot_files'.split()

        for k in bool_values:
            val = rd(k)
            if val:
                setattr(config, k, val[0] in 'yta' if val else False)

        list_values = 'blacklisted_extensions'.split()
        for k in list_values:
            val = rd(k).strip()
            if val:
                val = tuple(x.strip() for x in val.split(','))
                setattr(config, k, val)

        config.host, port = (_parser.get('uwsgi', 'http-socket') or '0.0.0.0:8080').split(':')
        config.port = int(port)

    if root_changed or not filename:
        config.shared_root = os.path.abspath(config.shared_root.rstrip(os.path.sep)) # path for shared files
        config.shared_db = os.path.abspath(os.path.join(config.shared_root, '.weye_db')) # path for shared files database

    try:
        os.mkdir(config.shared_db)
    except (OSError, IOError):
        pass

import_conf()

