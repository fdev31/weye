#!/bin/sh
if [ "$1" == "" ]; then
    OUT="mimes.js"
else
    OUT=$1
fi

PDIR="../static/mime/"

mkdir $PDIR/js


echo "" > $OUT
RDR=">> $OUT"

echo "mimes = {" >> $OUT
first=1

for n in */view.js ; do
    if [ $first -eq 1 ]; then
        first=0
    else
        echo "    ," >> $OUT
    fi

    name=`dirname $n|head -n1`

    echo $name | sed -E -e 's/^/    "/' -e 's/$/": {\n      display:/' >> $OUT

    grep -Ev '^[ \t]*$' $n | sed -e 's/^ *function  *display/function/' -e 's/^/        /' -e '$s/;//' >> $OUT

    echo '        , name: "'$name'"' >> $OUT

    if [ -f "$name/style.css" ]; then
        echo '        , stylesheet: true' >> $OUT
        cp $name/style.css ${PDIR}/js/$name/
    fi

    if [ -f "$name/dependencies.js" ]; then
        echo '    , dependencies: ' >> $OUT
        sed 's/^/        /' < "$name/dependencies.js" >> $OUT
    fi

    echo "    }" >> $OUT

    if [ -d "$name/js" ]; then
        mkdir ${PDIR}js/$name 2>/dev/null
        cp -r $name/js/* ${PDIR}js/$name/
    fi

done
echo "}" >> $OUT
for line in `cat aliases.txt`; do
    echo $line | sed -e "s/^/mimes\['/" -e "s/:/']=mimes['/" -e "s/$/']/" >> $OUT
done
