"use strict";

// Shorthand function
function inherits(new_cls, base_cls) {
    new_cls.prototype = Object.create( base_cls.prototype );
    new_cls.prototype.constructor = new_cls;
};

// Standard javascript objects overloading

String.prototype.endswith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.prototype.startswith = function(prefix) {
    return !! this.match(RegExp('^'+prefix));
};

// utils
function copy(obj, blacklist) {
    var o = {}
    if (blacklist) {
        for(var key in obj) {
            var blisted = false;
            for (var bl in blacklist) {
                if( blacklist[bl] === key )
                    blisted = true;
            }
            if (! blisted)
                o[key] = obj[key];
        }
    } else {
        for(var key in obj) {
            o[key] = obj[key];
        }
    }
    return o;
};

// from MDN:
function instanceOf(object, constructor) {
    while (object != null) {
        if (object == constructor.prototype)
            return true;
        object = Object.getPrototypeOf(object);
    }
    return false;
}
