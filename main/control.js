
(function(){

	var main_idpath = 'sys.main';
	var main_version = '0.1';
	var jns;

	var logmessage = require('../util/logging.js').logmessage;
	var cs = require('../ui/commandserver.js');
	var CommandServer = cs.Server;
	var command_routes = require('./commands.js').routes;
	var webserver_routes = require('./webserver.js').routes;
	
	exports.init = function(thejns) {
		jns = thejns;
		logmessage('JNS '+main_version);
		jns.registry.register(main_idpath,messagehandler);
	}

	exports.startCommandServer = function(webroot,port) {	
		logmessage('- about to listen on port '+port);
		jns.commandserver = new CommandServer(webroot,port,command_routes);
		jns.commandserver.listen();
	};
	
	exports.startWebServer = function(webroot,port) {
		logmessage('- about to listen on port '+port);
		jns.webserver = new CommandServer(webroot,port,webserver_routes);
		jns.webserver.listen();		
	}
	
	function messagehandler(idpath,message) {
		jns.messaging.noforeignidpath(idpath,main_idpath);
		logmessage("messagehandler: "+message.messagetype);
		switch (message.messagetype) {
			case 'basic.identify': return 'JNS '+main_version;
			case 'basic.shutdown':
				if (! jns.shuttingdown) {
					jns.shuttingdown = true;
					jns.registry.broadcast('sys.','basic.shutdown');
					logmessage('main shutting down');
					process.exit(0);
				}
			default: throw new Error(main_idpath+': unknown message - '+message.messagetype);
		}
	}

})();
