/*
 * Although there are no dependancies we're still able to pass through 'require' as an argument.
 * Explanation: https://gist.github.com/1663422#gistcomment-78062
 */
define(function(require){

	return {
		combine: require('./combine'), 
		filter: require('./filter'),
		forEach: require('./forEach'),
		indexOf: require('./indexOf'),
		lastIndexOf: require('./lastIndexOf'),
		map: require('./map'),
		reduce: require('./reduce'),
		reduceRight: require('./reduceRight'),
		toArray: require('./toArray'),
		unique: require('./unique')
	};

});