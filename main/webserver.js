
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
						stdres(data,res);
					}
				});
			}
			else {
				stdres('index '+req.params.top,res);
			}
		}
	}
	
	function webhandler_status() {		
		return function(webroot,req,res) {
			stdres('status '+req.params.id,res);
		}
	}
	
	function file_contents(path) {
		return fs.readFileSync(path,'utf8');
	}
	

})();
