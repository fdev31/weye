.PHONY: themes jsapi doc mimes theme jscode all js

help:
	@echo ""
	@echo "Targets:"
	@echo ""
	@echo " themes: build 'static/css/theme.css' from 'themes/' (requires lessc -- see default.less file)"
	@echo "    doc: Build Sphinx doc"
	@echo "     js: **jsapi + jscode"
	@echo "  jsapi: extract reST text from 'static/application.js' and save it to 'doc/source/dev/'"
	@echo " jscode: *Generate static/nano.js code from src/jscode folder, including mimes/ information"
	@echo "    all: all at once"
	@echo ""
	@echo "   * you have to type 'make' in the 'mimes' folder if you make change inside this folder"
	@echo "  ** In order to debug, run 'JSMIN=cat make js' instead of 'make js'"


PFX='#################### '
SFX=' ####################'
SFX=' '
JSAPI=doc/source/dev/jsapi.rst
JSFILES=src/jscode/jsbase.js src/jscode/startup.js src/jscode/templates.js src/jscode/resources.js src/jscode/ui.js src/jscode/core.js
JSMIN?=jsmin

theme:
themes:
	@ echo "${PFX} BUILDING THEMES ${SFX}"
	cd themes && make

js: jsapi jscode

jsapi: ${JSAPI}

jscode: static/nano.js

static/nano.js: mimes/mimes.js ${JSFILES}
	cat $^ | ${JSMIN} > $@

mimes/mimes.js:
	(cd mimes && make)

doc: jsapi
	(cd doc && make html)

src/jscode/body.rst: ${JSFILES}
	./_makejsdoc.sh $^ > $@

${JSAPI}: src/jscode/head.rst src/jscode/body.rst src/jscode/tail.rst
	cat $^ > $@


all: mimes themes jsapi jscode doc

