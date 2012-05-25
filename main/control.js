
(function(){

	var CommandServer = require('../ui/commandserver.js').Server;

	exports.startCommandServer = function(jns,port) {	
		jns.logmessage('- about to listen on port '+port);
		jns.commandserver = new CommandServer(port,'post','/command',commandhandler(),jns.logmessage);
		jns.commandserver.listen();
	};
	
	exports.startWebServer = function(jns,port) {
		jns.logmessage('- about to listen on port '+port);
		jns.webserver = new CommandServer(port,'get','/status',webhandler(),jns.logmessage);
		jns.webserver.listen();		
	}
	
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
				var message = {source: "sys.console", dest: argarr[0], messagetype: argarr[1]};
				return jns.registry.send(message.dest,message);
			}
		};
	
		var dispatch = require('../util/dispatch.js').dispatcher(commands);
	
		return function(line) {
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
	
	function webhandler() {
		
		return function(req) {
			jns.logmessage('webserver: '+req);
			return 'dummy';
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
	exports.messagehandler = messagehandler;


})();
