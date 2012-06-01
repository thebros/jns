
(function() {

	var logmessage = require('../util/logging.js').logmessage;
	var dispatch_module = require('../util/dispatch.js');
	var cs = require('../ui/commandserver.js');
	var stdres = cs.stdres;
	var errorres = cs.errorres;

	exports.routes = [
		{method: 'post', path: '/command', handler: commandhandler(*)}
	];

	function commandhandler(jns) {
	
		var commands = {
			
			version: function(jns,command,args) {
				return '0.1'
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
		
		var dispatch = dispatch_module.dispatcher(commands)
	
		return function(webroot,req,res) {
		
			var line = req.body.src;
			logmessage("main command: "+line);
			
			var result = dispatch(jns,line);
			if ('parseerror' in result) {
				errorres("error parsing command: "+result.parseerror,res);
				return;
			}
			
			if ('runerror' in result) {
				errorres("error running command: "+result.runerror,res);
				return;
			}
			
			if ('result' in result) {
				logmessage("main result: "+result.result);
				stdres(result,res);
			}
			
			errorres('internal error: no known key in dispatch result!',res);
		}
	}
	
})();
