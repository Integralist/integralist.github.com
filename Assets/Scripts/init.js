require.config({ 
	catchError: {
		define: true
	},
	paths: { 
		async: 'Plugins/async',
		tpl: 'Plugins/tpl'
	} 
});

require(['errorhandler'], function(handler) {
	require.onError = handler;
});

require(['profile', 'projects', 'watchlist', 'gists', 'activity', 'books', 'twitter']);