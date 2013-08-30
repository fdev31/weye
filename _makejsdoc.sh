#!/bin/sh
if [ -z "$1" ]; then
    echo "Syntax: $0 <js file> [js file]..."
fi
grep -E '^ *[/ ]{1}[*]( |$)' $* | grep -vE ' \*/ *$' | sed -E 's/^[^*]*\*( |$)//'
