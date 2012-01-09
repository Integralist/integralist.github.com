require.config({ 
	paths: { 
		async: 'Plugins/async',
		tpl: 'Plugins/tpl'
	} 
});

require(['profile', 'projects', 'watchlist', 'gists', 'activity', 'books', 'twitter']);