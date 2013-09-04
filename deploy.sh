#!/bin/sh
VENV=$1
SOURCES=${PWD}

HAVE_DEPS=1

(which virtualenv && which git && which unzip && which wget) || HAVE_DEPS=0

if [ ${HAVE_DEPS} -eq 0 ]; then
    echo ""
    echo "You need: wget, unzip, git & virtualenv to run this script !"
    exit 1
fi

if [ ! -d ${VENV} ]; then
    virtualenv ${VENV}
fi
source ${VENV}/bin/activate
cd ${VENV}
if [ ! -d weye ]; then
    git clone https://github.com/fdev31/weye || ( wget 'https://github.com/fdev31/weye/archive/master.zip' && unzip master.zip && mv weye-master weye )
fi
cp weye/requirements.txt .
pip install -r requirements.txt
cd weye
(cd mimes && ./mime_compiler.py && jsmin < mimes.js > ../static/mimetypes.js)
(cd static/mime && ./clean_dups.py expand)
exec uwsgi sample_config.ini
