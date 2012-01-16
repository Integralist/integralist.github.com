define(['require', 'Utils/when', 'Utils/array', 'async!https://github.com/Integralist.json'], function(require, when, array, feed){

	// Reference:
	// http://perfectionkills.com/unnecessarily-comprehensive-look-into-a-rather-insignificant-issue-of-global-objects-creation/
	var global = (function(){return this}()),
		doc = document,
		container = doc.getElementById('container'),
		activity = document.createElement('div'),
		frag = doc.createDocumentFragment(),
		feed_ul = doc.createElement('ul');
	
	activity.id = 'activity';
	
	function async(template, feeditem) {
		var dfd = when.defer(),
			tmp = template({ 
				date: feeditem.created_at,
				description: (feeditem.type === 'GistEvent') ? feeditem.payload.desc : feeditem.repository.description,
				type: feeditem.type.replace(/([A-Z])/g, function(str, cg1){
					str // matched substring
					cg1 // capture group
					return ' ' + cg1;
				}),
				url: feeditem.url
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
	
	function generateHTML(feed) {
		
		// when.reduce will preserve resolution order, so the resulting HTML will
	    // end up in the "expected" order (i.e. same order as items in repositories input)
	    // It also returns a Promise for the final, reduced value, which in this case
	    // will be the accumulated HTML string
	    return when.reduce(feed, function(html, item, i) {
	
	        // If require() returned a promise, we wouldn't need this deferred,
	        // but since it doesn't, we'll need to return our own promise, so that
	        // when.reduce can know when to proceed.
	        var dfd = when.defer();
	
	        // require the template, call async() to template it, then concat
	        // the newly created fragment onto the end of the accumulating html
	        require(['tpl!../Templates/Activity.tpl'], function(template) {
	
	            // wait for async to finish templating
	            when(async(template, item), function(htmlFragment) {
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
		p.innerHTML = 'Below is my recent activity on GitHub:';
		activity.appendChild(p);
	
	// Filter the feed by public items
	var public = array.filter(feed, function(item){
		if (!!item.public) {
			return item.public;
		}
	});
	
	// Wait for all HTML to be generated then insert into DOM
	when(generateHTML(public)).then(function(html){
		feed_ul.innerHTML = html;
		activity.appendChild(feed_ul);
		frag.appendChild(activity);
		container.appendChild(frag);
	});

});