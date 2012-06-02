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

	exports.routes = function(jns) {
		return [
			{method: 'get', path: '/:top', handler: webhandler_index()},
			{method: 'get', path: '/status/:id', handler: webhandler_status()}
		];
	};

	function webhandler_index() {		
		var indexpath = '/index.html';
		return function(webroot,req,res) {
			requrl = url.parse(req.url,true);
			if (requrl.pathname == indexpath) {
				file_contents(webroot+indexpath,function(err,data) {
					if (err) {
						errorres(err,res);
					}
					else {
						stdres({result: data},res);
					}
				});
			}
			else {
				stdres({result: 'index '+req.params.top},res);
			}
		}
	}
	
	function webhandler_status() {		
		return function(webroot,req,res) {
			stdres({result: 'status '+req.params.id},res);
		}
	}
	
	function file_contents(path) {
		return fs.readFileSync(path,'utf8');
	}
	

})();
