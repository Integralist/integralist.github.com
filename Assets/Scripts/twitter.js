define(['Utils/when'], function(when){

	// Reference:
	// http://perfectionkills.com/unnecessarily-comprehensive-look-into-a-rather-insignificant-issue-of-global-objects-creation/
	var global = (function(){return this}()),
		doc = document,
		container = doc.getElementById('container'),
		users = ['petermichaux', 'Cinsoft', 'jdalton', 'kangax', 'xkit', '__DavidFlanagan', 'BrendanEich', 'littlecalculist', 'mathias', 'kitcambridge', 'millermedeiros', 'briancavalier', 'unscriptable', 'angusTweets', 'WebReflection', 'thomasfuchs', 'padolsey'],
		twitter = document.createElement('div'),
		twitter_ul = doc.createElement('ul'),
		frag = doc.createDocumentFragment();
	
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
	
	function generateHTML(users) {
		
		// when.reduce will preserve resolution order, so the resulting HTML will
	    // end up in the "expected" order (i.e. same order as items in repositories input)
	    // It also returns a Promise for the final, reduced value, which in this case
	    // will be the accumulated HTML string
	    return when.reduce(users, function(html, user, i) {
	
	        // If require() returned a promise, we wouldn't need this deferred,
	        // but since it doesn't, we'll need to return our own promise, so that
	        // when.reduce can know when to proceed.
	        var dfd = when.defer();
	
	        // require the template, call async() to template it, then concat
	        // the newly created fragment onto the end of the accumulating html
	        require(['tpl!../Templates/Twitter.tpl'], function(template) {
	
	            when(async(template, user)).then(function(htmlFragment){
	            		// Accumulate html fragments into final html
                    	dfd.resolve(html + htmlFragment);
					},
	                // If async fails, reject so that when.reduce knows something went wrong
	                dfd.reject
				);
				
	        });
	
	        // return the promise so when.reduce knows when to proceed
	        return dfd.promise;
	    }, ''); // blank string as the initial value for the reduce computation
		
	}
	
	var p = doc.createElement('p');
		p.className = 'heading';
		p.innerHTML = "Below are a few twitter'ers I recommend following:";
		twitter.appendChild(p);
	
	// Wait for all HTML to be generated then insert into DOM
	when(generateHTML(users)).then(function(html){
		twitter_ul.innerHTML = html;
		twitter.appendChild(twitter_ul);
		frag.appendChild(twitter);
		container.appendChild(frag);
	});

});