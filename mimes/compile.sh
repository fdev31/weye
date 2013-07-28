#!/bin/sh
if [ "$1" == "" ]; then
    OUT="mimes.js"
else
    OUT=$1
fi


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
    dirname $n |head -n1 | sed -E -e 's/^/    /' -e 's/$/: {\n      display:/' >> $OUT
    grep -Ev '^[ \t]*$' $n | sed -e 's/^ *function  *display/function/' -e 's/^/        /' -e '$s/;//' >> $OUT
    echo "    }" >> $OUT
done
echo "}" >> $OUT
