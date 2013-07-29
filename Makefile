.PHONY: themes jsapi doc mimes

all:
	@echo "Targets:"
	@echo " themes"
	@echo " jsapi"
	@echo " mimes"
	@echo " doc"

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
