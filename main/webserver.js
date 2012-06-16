/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {

	var url = require('url');
	var fs = require('fs');
	var cs = require('../ui/commandserver.js');
	var CommandServer = cs.Server;
	var stdres = cs.stdres;
	var errorres = cs.errorres;
	var exwrap = require('../exceptions/exwrap.js').exwrap;
	var logging = require('../util/logging.js');

	exports.routes = function(jns) {
		return [
			{method: 'get', path: '/:top', handler: webhandler_index()},
			{method: 'get', path: '/status/:id', handler: webhandler_status()}
		];
	};

	function webhandler_index() {		
		var indexpath = '/index.html';
		return exwrap(function webhandler_index_handler(webroot,req,res) {
			requrl = url.parse(req.url,true);
			console.log('requrl='+logging.show(requrl));
			if (requrl.pathname == indexpath) {
				console.log('loading '+webroot+indexpath);
				file_contents(webroot+indexpath,function(err,data) {
					if (err) {
						console.log(' - error loading: '+err);
						errorres({error: err},res);
					}
					else {
						console.log(' - loaded: '+data);
						stdres({result: data},res);
					}
				});
			}
			else {
				stdres({result: 'index '+req.params.top},res);
			}
		});
	}
	
	function webhandler_status() {		
		return exwrap(function webhandler_status_handler(webroot,req,res) {
			stdres({result: 'status '+req.params.id},res);
		});
	}
	
	var file_contents = exwrap(function file_contents(path,callback) {
		return fs.readFile(path,'utf8',callback);
	});
	

})();
