THEME=default

CSS=../static/css/theme.css
JS=../static/js/bootstrap.min.js
CSSFILES=${THEME}.less bootstrap-glyphicons.less jquery.pnotify.default.less

SRC=${CSS} ${JS}

all: ${SRC}

${CSS}: ${CSSFILES}
	lessc $< $@

${JS}: bootstrap/bootstrap.js	bootstrap/dropdown.js  bootstrap/modal.js  bootstrap/popover.js  bootstrap/tab.js
	cat $^ | jsmin > $@
