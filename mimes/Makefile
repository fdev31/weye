.PHONY: build test
OUT=mimes.js

all: build test

build:
	 ./compile.sh ${OUT}

${OUT}: build

test: build ${OUT}
	js ${OUT}

install: ${OUT}
#	jsmin < ${OUT} > ../static/mimetypes.js
	cp ${OUT} ../static/mimetypes.js

