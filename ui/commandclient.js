/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function(){
	
	var logmessage = require('../util/logging.js').logmessage;
	var exwrap = require('../exceptions/exwrap.js').exwrap;

	var options = {
	   host: 'localhost',
	   port: 9913,
	   path: '/command',
	   method: 'POST'
	};

	var http = require('http');

	exports.send = exwrap(function(message,callback,logres) {
		
		var tosend;
		
		var req = http.request(options, function(res) {
			if (logres) {
				logmessage('commandclient.request.info: STATUS: ' + res.statusCode);
				logmessage('commandclient.request.info: HEADERS: ' + JSON.stringify(res.headers));
			}
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
		    	if (logres) {
					logmessage('commandclient.request.info: BODY: ' + chunk);
				}
				callback(chunk);
			});
		});

		req.on('error', function(e) {
		  logmessage('commandclient.request.error: problem with request: ' + e.message);
		});

		req.setHeader('Transfer-Encoding','chunked');
		req.setHeader('content-type','application/json');

		// write data to request body
		tosend = JSON.stringify({src: message});
		if (logres) {
			logmessage('commandclient.request.info: sending: '+tosend);
		}
		req.write(tosend);

		req.end();
	});
	
})();
