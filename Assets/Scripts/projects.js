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
	
	// Get user's Github repo data (this inc. repos being watched by user) and pass it to the callback function when loaded
	user.watching(function(data){
	
		var project = document.createElement('div'),
			frag = doc.createDocumentFragment(),
			repo_ul = doc.createElement('ul'),
			repo = data.repositories,
			len = repo.length,
			timer,
			last,
			fin;
		
		project.id = 'project';
		
		function async(template, repo) {
			var dfd = when.defer(),
				tmp = template({ 
					project: repo.name,
					url: repo.url,
					link: repo.url,
					description: repo.description
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
			p.innerHTML = 'Below are my own projects on GitHub (in no-particular order):';
			project.appendChild(p);
		
		// Loop through all the repositories finding those that below to the user
		for (var i = 0; i < len; i++) {
			// Keep track of the current iteration value
			// If we're on the last interfaction set 'last' to true
			if (i === len-1) {
				last = true;
			}
			
			if (repo[i].owner === username) {
				// Because 'require' is asynchronous we need an immediately invoked function expression
				// and to pass through the current repo as a parameter
				(function(repo){
					// Pull in relevant template and insert associated data
					require(['tpl!../Templates/Projects.tpl'], function(template) {
						/* 
						 * Because the loading of the template is done asynchronously
						 * we cannot insert each processed <li>.
						 * So we put the template processing code inside a function and return a Promise(Deferred object)
						 * Then when the Promise has been resolved we add the finished data to the <ul>
						 * And lastly we set the 'fin' variable to true so we know the loop has finished (see 'forloop' function above).
						 */
						when(async(template, repo)).then(function(data){
							repo_ul.innerHTML += data;
							if (last) {
								fin = true;
							} 
						});
					});
				}(repo[i]))
			}
		}
		
		/*
		 * Because the above for loop is processing data asynchronously
		 * we cannot just append the repo_ul data to the DOM at the bottom of the script
		 * because the above loop is no longer a standard synchronous loop (so repo_ul would be empty)
		 * So we execute a custom forloop() function which returns a Promise(Deferred object).
		 * When the Promise is resolved we know we can append the data to the DOM.
		 */
		when(forloop()).then(function(){
			project.appendChild(repo_ul);
			frag.appendChild(project);
			container.appendChild(frag);
		});
		
	});

});