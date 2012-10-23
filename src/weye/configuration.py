import logging

logging.basicConfig()
log = logging.getLogger()
log.setLevel(logging.WARNING)

class Config(object): pass

config = Config()

# set the defaults
config.debug = False
config.static_root = 'static'
