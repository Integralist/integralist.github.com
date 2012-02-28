define(function(){

	var isDefined = function(o) {
		/**
		 * Item is defined if it's not null or undefined.
		 * 
		 * We use strict equality for null rather than checking the 'typeof' result 
		 * as the ES3 specification allows host implementation to return 'null' value as 'object'
		 */
		return o !== null && o !== undefined;
	};
	
	return isDefined;

});