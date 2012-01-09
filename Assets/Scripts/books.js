define(['Utils/when'], function(when){

	// Reference:
	// http://perfectionkills.com/unnecessarily-comprehensive-look-into-a-rather-insignificant-issue-of-global-objects-creation/
	var global = (function(){return this}()),
		doc = document,
		container = doc.getElementById('container'),
		list = [
			{ title:'Mastering Regular Expressions', author:'Jeffrey E. F. Fredl' },
			{ title:'Regular Expressions Cookbook', author:'Jan Goyvaerts & Steven Levithan' },
			{ title:'Version Control with Git', author:'Jon Loeliger' },
			{ title:'Test-Driven JavaScript Development', author:'Christian Johansen' },
			{ title:'JavaScript: The Definitive Guide', author:'David Flanagan' },
			{ title:'High Performance JavaScript', author:'Nicholas C. Zakas' },
			{ title:'Eloquent JavaScript', author:'Marijn Haverbeke' },
			{ title:'JavaScript Patterns', author:'Stoyan Stefanov' },
			{ title:'HTML5 Up and Running', author:'Mark Pilgrim' }
		],
		books = document.createElement('div'),
		frag = doc.createDocumentFragment(),
		books_ul = doc.createElement('ul'),
		len = list.length,
		timer,
		last,
		fin;
	
	books.id = 'books';
		
	function async(template, book) {
		var dfd = when.defer(),
			tmp = template({ 
				author: book.author,
				title: book.title
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
		p.innerHTML = 'Below are a few books I recommend reading:';
		books.appendChild(p);
	
	// Loop through all the repositories finding those that below to the user
	for (var i = 0; i < len; i++) {
		// Keep track of the current iteration value
		// If we're on the last interfaction set 'last' to true
		if (i === len-1) {
			last = true;
		}
		
		// Because 'require' is asynchronous we need an immediately invoked function expression
		// and to pass through the current repo as a parameter
		(function(book){
			// Pull in relevant template and insert associated data
			require(['tpl!../Templates/Books.tpl'], function(template) {
				/* 
				 * Because the loading of the template is done asynchronously
				 * we cannot insert each processed <li>.
				 * So we put the template processing code inside a function and return a Promise(Deferred object)
				 * Then when the Promise has been resolved we add the finished data to the <ul>
				 * And lastly we set the 'fin' variable to true so we know the loop has finished (see 'forloop' function above).
				 */
				when(async(template, book)).then(function(data){
					books_ul.innerHTML += data;
					if (last) {
						fin = true;
					} 
				});
			});
		}(list[i]))
	}
	
	/*
	 * Because the above for loop is processing data asynchronously
	 * we cannot just append the gists_ul data to the DOM at the bottom of the script
	 * because the above loop is no longer a standard synchronous loop (so gists_ul would be empty)
	 * So we execute a custom forloop() function which returns a Promise(Deferred object).
	 * When the Promise is resolved we know we can append the data to the DOM.
	 */
	when(forloop()).then(function(){
		books.appendChild(books_ul);
		frag.appendChild(books);
		container.appendChild(frag);
	});

});