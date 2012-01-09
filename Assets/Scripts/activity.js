define(['require', 'Utils/when'], function(require, when){

	// Reference:
	// http://perfectionkills.com/unnecessarily-comprehensive-look-into-a-rather-insignificant-issue-of-global-objects-creation/
	var global = (function(){return this}()),
		doc = document,
		container = doc.getElementById('container');
	
	require(['async!https://github.com/Integralist.json'], function(feed){
		var activity = document.createElement('div'),
			frag = doc.createDocumentFragment(),
			feed_ul = doc.createElement('ul'),
			len = feed.length,
			timer,
			last,
			fin;
		
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
			p.innerHTML = 'Below is my recent activity on GitHub:';
			activity.appendChild(p);
		
		// Loop through all the repositories finding those that below to the user
		for (var i = 0; i < len; i++) {
			// Keep track of the current iteration value
			// If we're on the last interfaction set 'last' to true
			if (i === len-1) {
				last = true;
			}
			
			// Just in case I ever have any private data on GitHub and I forget to update this script!
			if (feed[i].public) {
				// Because 'require' is asynchronous we need an immediately invoked function expression
				// and to pass through the current repo as a parameter
				(function(feeditem){
					// Pull in relevant template and insert associated data
					require(['tpl!../Templates/Activity.tpl'], function(template) {
						/* 
						 * Because the loading of the template is done asynchronously
						 * we cannot insert each processed <li>.
						 * So we put the template processing code inside a function and return a Promise(Deferred object)
						 * Then when the Promise has been resolved we add the finished data to the <ul>
						 * And lastly we set the 'fin' variable to true so we know the loop has finished (see 'forloop' function above).
						 */
						when(async(template, feeditem)).then(function(data){
							feed_ul.innerHTML += data;
							if (last) {
								fin = true;
							} 
						});
					});
				}(feed[i]))
			}
		}
		
		/*
		 * Because the above for loop is processing data asynchronously
		 * we cannot just append the feed_ul data to the DOM at the bottom of the script
		 * because the above loop is no longer a standard synchronous loop (so feed_ul would be empty)
		 * So we execute a custom forloop() function which returns a Promise(Deferred object).
		 * When the Promise is resolved we know we can append the data to the DOM.
		 */
		when(forloop()).then(function(){
			activity.appendChild(feed_ul);
			frag.appendChild(activity);
			container.appendChild(frag);
		});
	});

});