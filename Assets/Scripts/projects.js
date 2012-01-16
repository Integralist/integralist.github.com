define(['require', 'Utils/github', 'Utils/when', 'Utils/array'], function(require, gh, when, array){

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
			repos = data.repositories;
		
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
		
		function generateHTML(repositories) {
			
			// when.reduce will preserve resolution order, so the resulting HTML will
		    // end up in the "expected" order (i.e. same order as items in repositories input)
		    // It also returns a Promise for the final, reduced value, which in this case
		    // will be the accumulated HTML string
		    return when.reduce(repositories, function(html, repo, i) {
		
		        // If require() returned a promise, we wouldn't need this deferred,
		        // but since it doesn't, we'll need to return our own promise, so that
		        // when.reduce can know when to proceed.
		        var dfd = when.defer();
		
		        // require the template, call async() to template it, then concat
		        // the newly created fragment onto the end of the accumulating html
		        require(['tpl!../Templates/Projects.tpl'], function(template) {
		
		            // wait for async to finish templating
		            when(async(template, repo), function(htmlFragment) {
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
			p.innerHTML = 'Below are my own projects on GitHub (in no-particular order):';
			project.appendChild(p);
		
		// Filter the repo's by owner
		var owned = array.filter(repos, function(repo){
			return repo.owner === username;
		});
		
		// Wait for all HTML to be generated then insert into DOM
		when(generateHTML(owned)).then(function(html){
			repo_ul.innerHTML = html;
			project.appendChild(repo_ul);
			frag.appendChild(project);
			container.appendChild(frag);
		});
		
	});

});