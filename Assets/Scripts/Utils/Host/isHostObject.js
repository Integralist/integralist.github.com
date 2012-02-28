define(function(){

	/*
	 * Feature Testing a Host Object
	 * Because a callable host object can legitimately have any tyepof result then it can't be relied upon.
	 * 
	 * @reference: http://michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
	 */
	 
	function isHostObject(object, property) {
		// object[property] protects against ES3 specification which allows null to be typeof 'object'
		// so we check if 'object' is returned and that object[property] coerces to true
		// then we group both checks (&& operator returns 2nd expression if 1st expression evaluates to true) and convert result into boolean
		return !!(typeof(object[property]) == 'object' && object[property]);
	}

	return isHostObject;

});