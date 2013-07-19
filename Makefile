.PHONY: themes jsapi doc

all:
	@echo "Targets:"
	@echo " themes"
	@echo " jsapi"

PFX='#################### '
SFX=' ####################'
SFX=' '
JS=doc/source/dev/jsapi.rst

themes:
	@ echo "${PFX} BUILDING THEMES ${SFX}"
	cd themes && make

jsapi: ${JS}

doc: jsapi
	(cd doc && make html)

${JS}: static/application.js
	./_makejsdoc.sh "$^" "$@"
