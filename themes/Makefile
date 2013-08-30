THEME=default

CSS=../static/css/theme.css
JS=../static/js/bootstrap.min.js
CSSFILES=${THEME}.less forms.less grid.less input-groups.less jumbotron.less labels.less list-group.less media.less mixins.less modals.less navbar.less navs.less normalize.less pager.less pagination.less panels.less popovers.less print.less progress-bars.less responsive-utilities.less scaffolding.less tables.less thumbnails.less tooltip.less type.less utilities.less variables.less wells.less bootstrap-glyphicons.less jquery.pnotify.default.css

SRC=${CSS} ${JS}

all: ${SRC}

${CSS}: ${CSSFILES}
	lessc $< $@

${JS}: bootstrap/bootstrap.js	bootstrap/dropdown.js  bootstrap/modal.js  bootstrap/popover.js  bootstrap/tab.js
	cat $^ | jsmin > $@
