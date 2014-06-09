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
function copy(obj, opts) {
    opts = opts || {};
    var o = {}
    if (opts.blacklist) {
        for(var key in obj) {
            var blisted = false;
            for (var bl in opts.blacklist) {
                if( opts.blacklist[bl] === key )
                    blisted = true;
            }
            if (! blisted)
                o[key] = obj[key];
        }
    } else {
        if (opts.whitelist) {
            for(var key in opts.whitelist) {
                o[key] = obj[key];
            }
        } else {
            for(var key in obj) {
                o[key] = obj[key];
            }
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
