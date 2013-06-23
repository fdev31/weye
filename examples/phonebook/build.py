#!/usr/bin/env python
T='templates'

import json
import os

templates = {}
infos = json.load(open('_infos.js'))
infos['templates'] = templates

for root, dirs, files in os.walk(T):
    for fname in files:
        if fname.endswith('.html'):
            templates[fname[:-5]] = open(os.path.join(root, fname)).read()

json.dump(infos, open('infos.js', 'w'))

print('Copy "infos.js" and "%s" to any folder containing some "phone_data.js" to turn it into a phonebook !'%infos['js'])
