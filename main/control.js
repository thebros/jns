/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function(){

	var main_idpath = 'sys.main';
	var main_version = '0.1';
	var jns;

	var logmessage = require('../util/logging.js').logmessage;
	var cs = require('../ui/commandserver.js');
	var CommandServer = cs.Server;
	var command_routes = require('./commands.js').routes;
	var webserver_routes = require('./webserver.js').routes;
	var TrackException = require('../exceptions/track.js').TrackException;
	var exwrap = require('../exceptions/exwrap.js').exwrap;
	
	exports.init = exwrap(function init(thejns) {
		jns = thejns;
		logmessage('| JNS '+main_version+' startup up');
		jns.registry.register(main_idpath,messagehandler);
	});

	exports.startCommandServer = exwrap(function startCommandServer(webroot,port) {	
		logmessage('main.startup.server.command.info: about to listen on port '+port);
		jns.commandserver = new CommandServer(webroot,port,command_routes(jns));
		jns.commandserver.listen();
	});
	
	exports.startWebServer = exwrap(function startWebServer(webroot,port) {
		logmessage('main.startup.server.web.info: about to listen on port '+port);
		jns.webserver = new CommandServer(webroot,port,webserver_routes(jns));
		jns.webserver.listen();		
	});
	
	var messagehandler = exwrap(function messagehandler(idpath,message) {
		jns.messaging.noforeignidpath(idpath,main_idpath);
		logmessage("main.messagehandler.info: "+message.messagetype);
		switch (message.messagetype) {
			case 'basic.identify': return 'JNS '+main_version;
			case 'basic.shutdown':
				if (! jns.shuttingdown) {
					jns.shuttingdown = true;
					jns.registry.broadcast('sys.','basic.shutdown');
					logmessage('| JNS shutting down');
					process.exit(0);
				}
			default: throw new TrackException('unknown message - '+message.messagetype,main_idpath);
		}
	});

})();
