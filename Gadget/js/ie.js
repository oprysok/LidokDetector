if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        "use strict";
        if (this === undefined || this === null) {
            throw new TypeError('"this" is null or not defined');
        }
        var length = this.length >>> 0; // Hack to convert object.length to a UInt32
        fromIndex = +fromIndex || 0;
        if (Math.abs(fromIndex) === Infinity) {
            fromIndex = 0;
        }
        if (fromIndex < 0) {
            fromIndex += length;
            if (fromIndex < 0) {
                fromIndex = 0;
            }
        }
        for (;fromIndex < length; fromIndex++) {
          if (this[fromIndex] === searchElement) {
                return fromIndex;
          }
        }
        return -1;
    };
}
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
}