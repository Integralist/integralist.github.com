define(function () {

	var toArray = function(list) {
		var results = Array.prototype.slice.call(list);
		return results;
	}
	
	// Perform a simple check to determine if the browser is capable of
	// converting a NodeList to an array using builtin methods.
	// Also verifies that the returned array holds DOM nodes
	// (which is not the case in the Blackberry browser)
	try {
		Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType; // Provide a fallback method if this does not work
	} catch (e) {
		toArray = function(list) {
			for (var results = [], length = list.length; length--;) {
				results[length] = list[length];
			}
			return results;
		};
	}

    return toArray;

});