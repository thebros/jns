
(function(){
	
	var options = {
	   host: 'localhost',
	   port: 9913,
	   path: '/command',
	   method: 'POST'
	};

	var http = require('http');

	exports.send = function(message,callback,logres) {
		
		var tosend;
		
		var req = http.request(options, function(res) {
			if (logres) {
				console.log('STATUS: ' + res.statusCode);
				console.log('HEADERS: ' + JSON.stringify(res.headers));
			}
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
		    	if (logres) {
					console.log('BODY: ' + chunk);
				}
				callback(chunk);
			});
		});

		req.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});

		req.setHeader('Transfer-Encoding','chunked');
		req.setHeader('content-type','application/json');

		// write data to request body
		tosend = JSON.stringify({src: message});
		if (logres) {
			console.log('sending: '+tosend);
		}
		req.write(tosend);

		req.end();
	}
	
})();
