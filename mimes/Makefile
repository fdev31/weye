.PHONY: build test
OUT=mimes.js
JSMIN=jsmin
#JSMIN=cat # Ucomment this line in case of problem

all: build test

build:
	 ./compile.py ${OUT}

${OUT}: build

test: build ${OUT}
	js ${OUT}

debug:
	cp ${OUT} ../static/mimetypes.js

install: ${OUT}
	${JSMIN} < ${OUT} > ../static/mimetypes.js

extract:
	./extract_mimes.py | sort > ../src/weye/mimedata.txt
