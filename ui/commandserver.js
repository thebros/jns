
(function() {

	var express = require('express');
	var url = require('url');
	
	// call with 'new'!
	exports.Server = function(webroot,portno,routes,logmessage) {

		if (this==global) {
			throw new Error("commandserver.Server must be called with 'new'")
		}
		
		var staticroute = {urlpath: '/static', filepath: webroot+'/static'};
		this.httpserver = makeserver(routes,staticroute,logmessage);
		
		this.listen = function() {
			this.httpserver.listen(portno);
		}
		
		return this;
	}
	
	function makeserver(routes,staticroute,logmessage) {
		
		var app = express.createServer();
		app.use(express.bodyParser());	
		if (staticroute) {
			app.use(express.static(staticroute.urlpath));		
		}	
		app.use(express.errorHandler(
				{
					dumpExceptions: true,
					showStack: true
				}
			)
		);

		var route;
		for (var r = 0; r<routes.length; ++r) {
			route = routes[r];
			app[route.method](route.path,wraphandler(route,logmessage));
		}

		if (staticroute) {
			app.use(staticroute.urlpath,express.static(staticroute.filepath));		
		}
		
		return app;
	}
	
	function loadParams(params,values) {
		return function(req,res,next) {
			var p;
			var qvalue;
			req.requrl = url.parse(req.url,true);
			for (p in params) {
				qvalue = req.requrl.query[p]
				if (qvalue) {
					values[p] = qvalue;
				}
				else {
					values[p] = '';
				}
			}
		}
	}
	
	function wraphandler(route,logmessage) {
	
		return function(req,res) {
			var result;
			var message;
			var resultx;
			var content_type;
			logmessage('serving '+route.method+' '+route.path);
			try {
				result = route.handler(req);
				if (result.substring(0,1)=='<') {
					content_type = 'text/html';
					resultx = result;
				}
				else {
					content_type = 'application/json';
					resultx = JSON.stringify(result);
				}
				logmessage(content_type+': '+resultx);
				res.writeHead(200,{'Content-type': content_type});
				res.end(resultx);
			}
			catch (ex) {
				
				console.log("Exception!");
				
				result = ex.toString();
				logmessage(result);
			}			
		}
	}
})();


exports.testserver = function() {

	var s = new exports.Server(9913,testhandler,testlogmessage);
	s.listen();
	
	function testhandler(line) {
		return JSON.stringify({testhandler: line});
	}
	
	function testlogmessage(message) {
		console.log("testlogmessage: "+message);
	}
	
	return s;
}
