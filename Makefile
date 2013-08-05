.PHONY: themes jsapi doc mimes

help:
	@echo ""
	@echo "Targets:"
	@echo ""
	@echo " themes: build 'static/css/theme.css from 'themes/default.less' (requires lessc)"
	@echo "  jsapi: extract reST text from 'static/application.js' and save it to 'doc/source/dev/'"
	@echo "  mimes: compiles an minimize (jsmin) mime folder and install it to static/mimetypes.js"
	@echo "    doc: Build Sphinx doc"
	@echo "    all: all at once"

all: mimes themes jpapi doc

PFX='#################### '
SFX=' ####################'
SFX=' '
JS=doc/source/dev/jsapi.rst

themes:
	@ echo "${PFX} BUILDING THEMES ${SFX}"
	cd themes && make

jsapi: ${JS}

mimes:
	(cd mimes && make install)

doc: jsapi
	(cd doc && make html)

${JS}: static/application.js
	./_makejsdoc.sh "$^" "$@"
