define(function () {

    /**
     * ES5 Array.forEach
     * @author Miller Medeiros
     * @version 0.3.0 (2011/11/15)
     */
    var forEach = Array.prototype.forEach?
					function (arr, callback, thisObj) {
                        arr.forEach(callback, thisObj);
                    } :
                    function (arr, callback, thisObj) {
                        for (var i = 0, n = arr.length, item; i < n; i++) {
                            //according to spec callback should only be called for
                            //existing items
                            if (i in arr) {
                                callback.call(thisObj, arr[i], i, arr);
                            }
                        }
                    };

    return forEach;

});