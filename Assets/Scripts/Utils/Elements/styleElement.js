define(function(){

	/**
	 * Following method will reset the specified element's style value using CSS syntax
	 *
	 * Example usage:
	 
	  	styleElement(element, {
			'left': x + 'px',
			'top': y + 'px'
		});
	 
	 * 
	 * @param element { Node|Element } the HTML element to reset the position for
	 * @param setting { Object } the property name is the CSS (CSS syntax) property we need to set and the value is the CSS property value
	 * @return undefined {  } no explicitly returned value
	 */	
	var styleElement = function(element, settings) {
		var normalise = '';
		
		for (var i in settings) {
			// Firefox was the only browser that didn't recognise 'border-bottom' (uses 'borderBottom' instead).
			normalise += i + ':' + settings[i] + ';'; // took off toCamelCase as it broke z-index
		}
		
		// CAREFUL! This may be better than constantly touching the DOM and setting individual styles,
		// but it will over-write all previously set styles!
		element.style.cssText = normalise;
	}
	
	return styleElement;

});