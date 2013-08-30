.PHONY: themes jsapi doc mimes theme jscode all

help:
	@echo ""
	@echo "Targets:"
	@echo ""
	@echo " themes: build 'static/css/theme.css from 'themes/default.less' (requires lessc)"
	@echo "    doc: Build Sphinx doc"
	@echo "  jsapi: extract reST text from 'static/application.js' and save it to 'doc/source/dev/'"
	@echo " jscode: Generate static/nano.js code from src/jscode folder"
	@echo "    all: all at once"


PFX='#################### '
SFX=' ####################'
SFX=' '
JSAPI=doc/source/dev/jsapi.rst
JSFILES=src/jscode/jsbase.js src/jscode/startup.js src/jscode/templates.js src/jscode/resources.js src/jscode/ui.js src/jscode/core.js

theme:
themes:
	@ echo "${PFX} BUILDING THEMES ${SFX}"
	cd themes && make

jsapi: ${JSAPI}

jscode: static/nano.js

static/nano.js: mimes/mimes.js ${JSFILES}
	cat $^ | jsmin > $@

mimes/mimes.js:
	(cd mimes && make)

doc: jsapi
	(cd doc && make html)

src/jscode/body.rst: ${JSFILES}
	./_makejsdoc.sh $^ > $@

${JSAPI}: src/jscode/head.rst src/jscode/body.rst src/jscode/tail.rst
	cat $^ > $@


all: mimes themes jsapi jscode doc

