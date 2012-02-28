require.config({ 
	catchError: {
		define: true
	},
	paths: {
		async: 'Plugins/async',
		tpl: 'Plugins/tpl'
	} 
});

require(['errorhandler'], function (handler) {
	require.onError = handler;
});

require(['require', 'Utils/API/github', 'Utils/Patterns/when', 'async!http://twitter.com/statuses/user_timeline/integralist.json'], function (require, gh, when, tw) {

	//TODO - make list dynamic so I only have to change it on twitter
	//console.log(tw[0].user.description);
	
	// Reference:
	// http://perfectionkills.com/unnecessarily-comprehensive-look-into-a-rather-insignificant-issue-of-global-objects-creation/
	var global = (function(){return this}()),
		doc = document,
		container = doc.getElementById('github'),
		user = gh.user('Integralist');
	
	// Get user's Github profile data and pass it to the callback function when loaded
	user.show(function(data){
	
        doc.getElementById('picture').src = 'https://secure.gravatar.com/avatar/' + data.user.gravatar_id + '?s=240&d=https://github.com/images/gravatars/gravatar-240.png';
	
		var profile = document.createElement('div');
		
		function async(template) {
			var dfd = when.defer(),
				tmp = template({
					gistcount: data.user.public_gist_count,
					location: data.user.location,
					name: data.user.name, 
					repocount: data.user.public_repo_count,
					since: data.user.created_at.substring(0, 4)
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
		
		// Pull in relevant template and insert associated data
		require(['tpl!../Templates/Profile.tpl'], function(template) {
			/* 
			 * Because the loading of the template is done asynchronously
			 * we cannot append 'frag' at the bottom of this script (as frag would be empty)
			 * So we put the template processing code inside a function and return a Promise(Deferred object)
			 * Then when the Promise has been resolved we append the finished data to the DOM
			 */
			when(async(template)).then(function(data){
				profile.innerHTML = data;
				container.appendChild(profile);
			});
		});
		
	});

});