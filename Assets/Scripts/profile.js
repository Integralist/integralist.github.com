define(['require', 'Utils/github', 'Utils/when'], function(require, gh, when){

	// Reference:
	// http://perfectionkills.com/unnecessarily-comprehensive-look-into-a-rather-insignificant-issue-of-global-objects-creation/
	var global = (function(){return this}()),
		doc = document,
		container = doc.getElementById('container'),
		app = global.app || {},
		username = 'Integralist',
		user;
	
	// Every module uses Github data
	// To prevent calling Github API for every script we cache the content in a variable
	// So the first script to load creates a global property called 'app' and stores user data in 'app.user'
	if (app.user === undefined) {
		user = app.user = gh.user(username);
	}
	
	// Get user's Github profile data and pass it to the callback function when loaded
	user.show(function(data){
	
		var profile = document.createElement('div'),
			frag = doc.createDocumentFragment();
		
		profile.id = 'profile';
		
		function async(template) {
			var dfd = when.defer(),
				tmp = template({
					blog: data.user.blog,
					gistcount: data.user.public_gist_count,
					img: data.user.gravatar_id,
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
				frag.appendChild(profile);
				container.insertBefore(frag, container.firstChild);
			});
		});
		
	});

});