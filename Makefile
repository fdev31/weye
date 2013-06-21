.PHONY:themes

all: themes

PFX='#################### '
SFX=' ####################'
SFX=' '

themes:
	@ echo "${PFX} BUILDING THEMES"
	cd themes && make

