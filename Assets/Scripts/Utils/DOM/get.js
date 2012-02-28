/*
 * Although there are no dependancies we're still able to pass through 'require' as an argument.
 * Explanation: https://gist.github.com/1663422#gistcomment-78062
 * Reference: https://github.com/jrburke/requirejs/wiki/Differences-between-the-simplified-CommonJS-wrapper-and-standard-AMD-define
 */
define(function(require){

	return {
		docheight: require('./getDocHeight'),
		el: require('./getEl'),
		offset: require('./getOffset'),
		tag: require('./getTag'),
		type: require('./getType')
	};

});