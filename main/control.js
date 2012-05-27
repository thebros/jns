
(function(){

	var main_idpath = 'sys.main';
	var main_version = '0.1';
	var jns;

	var url = require('url');
	var fs = require('fs');
	var CommandServer = require('../ui/commandserver.js').Server;
	
	exports.init = function(thejns) {
		jns = thejns;
		jns.logmessage('JNS '+main_version);
		jns.registry.register(main_idpath,messagehandler);
	}

	exports.startCommandServer = function(webroot,port) {	
		jns.logmessage('- about to listen on port '+port);
		var routes = [
			{method: 'post', path: '/command', handler: commandhandler()}
		];
		jns.commandserver = new CommandServer(webroot,port,routes,jns.logmessage);
		jns.commandserver.listen();
	};
	
	function commandhandler() {
	
		var commands = {
			
			version: function(jns,command,args) {
				return "0.1"
			},
			
			registry: function(jns,command,args) {
				return jns.registry.dump();
			},
			
			send: function(jns,command,args) {
				var argarr = args.split(/\s*,\s*/);
				var dest = argarr[0];
				var messagetype = argarr[1];
				if (argarr.length < 2) {
					return jns.registry.send(dest,{error:'expected arguments: dest,messagetype'});
				}
				return jns.registry.send(message.dest,{source: "sys.console", dest: dest, messagetype: messagetype});
			}
		};
	
		var dispatch = require('../util/dispatch.js').dispatcher(commands);
	
		return function(req) {
			var line = req.body.src;
			jns.logmessage("main command: "+line);
			var result = dispatch(jns,line);
			if ('parseerror' in result) {
				return {error: "error parsing command: "+result.parseerror};
			}
			if ('runerror' in result) {
				return {error: "error running command: "+result.runerror};
			}
			if ('result' in result) {
				jns.logmessage("main result: "+result.result);
				return result;
			}
			return 'internal error: no known key in dispatch result!';
		}
	}
	
	function messagehandler(idpath,message) {
		jns.messaging.noforeignidpath(idpath,main_idpath);
		jns.logmessage("messagehandler: "+message.messagetype);
		switch (message.messagetype) {
			case 'basic.identify': return 'JNS '+main_version;
			case 'basic.shutdown':
				if (! jns.shuttingdown) {
					jns.shuttingdown = true;
					jns.registry.broadcast('sys.','basic.shutdown');
					jns.logmessage('main shutting down');
					process.exit(0);
				}
			default: throw new Error(main_idpath+': unknown message - '+message.messagetype);
		}
	}

	exports.startWebServer = function(webroot,port) {
		jns.logmessage('- about to listen on port '+port);
		var routes = [
			{method: 'get', path: '/:top', handler: webhandler_index()},
			{method: 'get', path: '/status/:id', handler: webhandler_status()}
		];
		jns.webserver = new CommandServer(webroot,port,routes,jns.logmessage);
		jns.webserver.listen();		
	}
	
	function webhandler_index() {		
		var indexpath = '/index.html';
		return function(req) {
			requrl = url.parse(req.url,true);
			if (requrl.pathname == indexpath) {
				return file_contents(jns.webroot+indexpath);
			}
			return 'index '+req.params.top;
		}
	}
	
	function webhandler_status() {		
		return function(req) {
			return 'status '+req.params.id;
		}
	}
	
	function file_contents(path) {
		return fs.readFileSync(path,'utf8');
	}
	
})();
