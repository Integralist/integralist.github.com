define(['Utils/when'], function(when){

	// Reference:
	// http://perfectionkills.com/unnecessarily-comprehensive-look-into-a-rather-insignificant-issue-of-global-objects-creation/
	var global = (function(){return this}()),
		doc = document,
		container = doc.getElementById('container'),
		books = [
			{ title:'Mastering Regular Expressions', author:'Jeffrey E. F. Fredl' },
			{ title:'Regular Expressions Cookbook', author:'Jan Goyvaerts & Steven Levithan' },
			{ title:'Version Control with Git', author:'Jon Loeliger' },
			{ title:'Test-Driven JavaScript Development', author:'Christian Johansen' },
			{ title:'JavaScript: The Definitive Guide', author:'David Flanagan' },
			{ title:'High Performance JavaScript', author:'Nicholas C. Zakas' },
			{ title:'Eloquent JavaScript', author:'Marijn Haverbeke' },
			{ title:'JavaScript Patterns', author:'Stoyan Stefanov' },
			{ title:'HTML5 Up and Running', author:'Mark Pilgrim' }
		]
		list = document.createElement('div'),
		books_ul = doc.createElement('ul'),
		frag = doc.createDocumentFragment();
	
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
	
	function generateHTML(books) {
		
		// when.reduce will preserve resolution order, so the resulting HTML will
	    // end up in the "expected" order (i.e. same order as items in repositories input)
	    // It also returns a Promise for the final, reduced value, which in this case
	    // will be the accumulated HTML string
	    return when.reduce(books, function(html, book, i) {
	
	        // If require() returned a promise, we wouldn't need this deferred,
	        // but since it doesn't, we'll need to return our own promise, so that
	        // when.reduce can know when to proceed.
	        var dfd = when.defer();
	
	        // require the template, call async() to template it, then concat
	        // the newly created fragment onto the end of the accumulating html
	        require(['tpl!../Templates/Books.tpl'], function(template) {
	
	            when(async(template, book)).then(function(htmlFragment){
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
		p.innerHTML = 'Below are a few books I recommend reading:';
		list.appendChild(p);
	
	// Wait for all HTML to be generated then insert into DOM
	when(generateHTML(books)).then(function(html){
		books_ul.innerHTML = html;
		list.appendChild(books_ul);
		frag.appendChild(list);
		container.appendChild(frag);
	});

});