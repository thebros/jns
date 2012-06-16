/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {

	var express = require('express');
	var url = require('url');
	var logging = require('../util/logging.js');
	var logmessage = logging.logmessage;
	var show = logging.show;
	var util = require('util');
	var TrackException = require('../exceptions/track.js').TrackException;
	var exwrap = require('../exceptions/exwrap.js').exwrap;
	
	// call with 'new'!
	exports.Server = exwrap(function Server(webroot,portno,routes) {

		if (this==global) {
			throw new TrackException("commandserver.Server must be called with 'new'",'Server');
		}
		
		var staticroute = {urlpath: '/static', filepath: webroot+'/static'};
		this.httpserver = makeserver(webroot,routes,staticroute);
		
		this.listen = function() {
			this.httpserver.listen(portno);
		}
		
		return this;
	});
	
	exports.stdres = exwrap(function stdres(result,res) {

		logmessage('commandserver.stdres.info: result='+show(result));		
		
		if (result.substring(0,1)=='<') {
			content_type = 'text/html';
			resultx = result;
		}
		else {
			content_type = 'application/json';
			resultx = JSON.stringify({result: result});
		}
		logmessage('commandserver.stdres.info: '+content_type+': '+resultx);
		res.writeHead(200,{'Content-type': content_type});
		res.end(resultx);
	});

	exports.errorres = exwrap(function errorres(result,res) {		
		logmessage('commandserver.errorres.info: route.handler returning '+show(result));		
		res.writeHead(500,{'Content-type': 'text/plain'});
		res.end(JSON.stringify({error: result}));
	});

	function makeserver(webroot,routes,staticroute) {
		
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
			app[route.method](route.path,wraphandler(webroot,route));
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
	
	function wraphandler(webroot,route) {
	
		return exwrap(function wrap(req,res) {
			var result;
			var message;
			var resultx;
			var content_type;
			logmessage('commandserver.wraphandler.info: serving '+route.method+' '+route.path);
			route.handler(webroot,req,res);
		});
	}
})();

