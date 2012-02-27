define(function(){

	return function(errObject) {
		requireType = errObject.requireType; 
        requireModules = errObject.requireModules;
        console.log(requireType, requireModules);
	};

});