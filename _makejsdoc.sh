#!/bin/sh
if [ -z "$2" ]; then
    echo "Syntax: $0 <IN: js file> <OUT: rst file>"
fi
grep -E '^ *[/ ]{1}[*]( |$)' $1 | grep -vE ' \*/ *$' | sed -E 's/^[^*]*\*( |$)//' > $2 && echo "ok"
