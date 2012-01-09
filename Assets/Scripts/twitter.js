define(['Utils/when'], function(when){

	// Reference:
	// http://perfectionkills.com/unnecessarily-comprehensive-look-into-a-rather-insignificant-issue-of-global-objects-creation/
	var global = (function(){return this}()),
		doc = document,
		container = doc.getElementById('container'),
		users = ['petermichaux', 'Cinsoft', 'jdalton', 'kangax', 'xkit', '__DavidFlanagan', 'BrendanEich', 'littlecalculist', 'mathias', 'kitcambridge', 'millermedeiros', 'briancavalier', 'unscriptable', 'angusTweets', 'WebReflection', 'thomasfuchs', 'padolsey'],
		twitter = document.createElement('div'),
		frag = doc.createDocumentFragment(),
		twitter_ul = doc.createElement('ul'),
		len = users.length,
		timer,
		last,
		fin;
	
	twitter.id = 'twitter';
		
	function async(template, user) {
		var dfd = when.defer(),
			tmp = template({ 
				username: user
			}),
			timer;
		
		// Because template() function is asynchronous (and no callback built-in)
		// we use a timer to keep track of 'tmp' value
		timer = global.setInterval(function(){ 
			(!!tmp) 
				? (global.clearInterval(timer), dfd.resolve(tmp)) 
				: null; 
		}, 25);			
		
		return dfd.promise;
	}
	
	function forloop() {
		var dfd = when.defer(),
			timer;
		
		// Because the outer for loop is processing asynchronous data
		// we use a timer to keep track of 'fin' value
		timer = global.setInterval(function(){
			if (fin) {
				global.clearInterval(timer);
				dfd.resolve();
			}
		}, 25);
		
		return dfd.promise;
	}
	
	var p = doc.createElement('p');
		p.className = 'heading';
		p.innerHTML = 'Below are a few twitter\'ers I recommend following:';
		twitter.appendChild(p);
	
	// Loop through all the repositories finding those that below to the user
	for (var i = 0; i < len; i++) {
		// Keep track of the current iteration value
		// If we're on the last interfaction set 'last' to true
		if (i === len-1) {
			last = true;
		}
		
		// Because 'require' is asynchronous we need an immediately invoked function expression
		// and to pass through the current repo as a parameter
		(function(user){
			// Pull in relevant template and insert associated data
			require(['tpl!../Templates/Twitter.tpl'], function(template) {
				/* 
				 * Because the loading of the template is done asynchronously
				 * we cannot insert each processed <li>.
				 * So we put the template processing code inside a function and return a Promise(Deferred object)
				 * Then when the Promise has been resolved we add the finished data to the <ul>
				 * And lastly we set the 'fin' variable to true so we know the loop has finished (see 'forloop' function above).
				 */
				when(async(template, user)).then(function(data){
					twitter_ul.innerHTML += data;
					if (last) {
						fin = true;
					} 
				});
			});
		}(users[i]))
	}
	
	/*
	 * Because the above for loop is processing data asynchronously
	 * we cannot just append the gists_ul data to the DOM at the bottom of the script
	 * because the above loop is no longer a standard synchronous loop (so gists_ul would be empty)
	 * So we execute a custom forloop() function which returns a Promise(Deferred object).
	 * When the Promise is resolved we know we can append the data to the DOM.
	 */
	when(forloop()).then(function(){
		twitter.appendChild(twitter_ul);
		frag.appendChild(twitter);
		container.appendChild(frag);
	});

});