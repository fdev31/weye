.PHONY: themes jsapi doc mimes theme jscode all js

MIMES_FILES=$(shell cd objects && ./compiler.py ls)

help:
	@echo ""
	@echo "Targets:"
	@echo ""
	@echo " themes: build 'static/css/theme.css' from 'themes/' (requires lessc -- see default.less file)"
	@echo "    doc: Build Sphinx doc"
	@echo "     js: **jsapi + jscode"
	@echo "  jsapi: extract reST text from 'static/application.js' and save it to 'doc/source/dev/'"
	@echo " jscode: *Generate static/nano.js code from src/jscode folder, including mimes/ information"
	@echo "  mimes: Update changes made into objects folder"
	@echo "    all: all at once"
	@echo ""
	@echo "  ** In order to debug, run 'JSMIN=cat make js' instead of 'make js'"


JSAPI=doc/source/dev/jsapi.rst
JSFILES=src/jscode/jsbase.js src/jscode/startup.js src/jscode/templates.js src/jscode/resources.js src/jscode/ui.js src/jscode/core.js
JSMIN?=jsmin

theme: themes

themes:
	cd themes && make
	@ echo "################# DONE: themes #################"

js: jsapi jscode
	@ echo "################# DONE: Javascript #################"

jsapi: ${JSAPI}
	@ echo "################# DONE: Javascript API #################"

jscode: static/nano.js
	@ echo "################# DONE: Javascript Code (minify) #################"

static/nano.js: ${JSFILES} objects/mimes.js
	cat $^ | ${JSMIN} > $@

objects/mimes.js: ${MIMES_FILES}
	(cd objects && ./compiler.py)

mimes: objects/mimes.js 
	@echo "################# DONE: Mime types database #################"

doc: jsapi
	@(cd doc && make html)
	@echo "################# DONE: Documentation #################"

src/jscode/body.rst: ${JSFILES}
	@echo "################# Generating Documentation content #################"
	./_makejsdoc.sh $^ > $@

${JSAPI}: src/jscode/head.rst src/jscode/body.rst src/jscode/tail.rst
	cat $^ > $@


all: mimes themes js doc

