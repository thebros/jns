/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {

	var logging = require('../util/logging.js');
	var logmessage = logging.logmessage;
	var show = logging.show;
	var dispatch_module = require('../util/dispatch.js');
	var cs = require('../ui/commandserver.js');
	var stdres = cs.stdres;
	var errorres = cs.errorres;
	var exwrap = require('../exceptions/exwrap.js').exwrap;

	exports.routes = function(jns) {
		return [
			{method: 'post', path: '/command', handler: commandhandler(jns)}
		];
	};

	var commandhandler = exwrap(function commandhandler(jns) {
	
		var commands = {
			
			// return the internal version of jns
			version: function(jns,command,args) {
				return '0.1'
			},
			
			// return a dump of the registry
			registry: function(jns,command,args) {
				return jns.registry.dump();
			},
			
			// send a message and return the result
			send: exwrap(function(jns,command,args) {
				if (!(/,/.test(args))) {
					return 'expected 2 arguments: DEST,MESSAGETYPE';
				}
				var argarr = args.split(/\s*,\s*/);
				var dest = argarr[0];
				var messagetype = argarr[1];
				return jns.registry.send(dest,{source: "sys.console", dest: dest, messagetype: messagetype});
			}),
		
			// set the logging filter from the given arguments	
			log: exwrap(function(jns,command,args) {
				logging.setfilter(args);
				return logging.currentfilter();
			})
		};
		
		var dispatch = dispatch_module.dispatcher(commands)
	
		return function(webroot,req,res) {
		
			var line = req.body.src;
			logmessage("command.line.info: "+line);
			
			var result = dispatch(jns,line);
			logmessage('command.result.info: '+show(result));
			
			if ('parseerror' in result) {
				errorres('error parsing command: '+result.parseerror,res);
				return;
			}
			
			if ('runerror' in result) {
				errorres('error running command: '+result.runerror,res);
				return;
			}
			
			if ('result' in result) {
				stdres(result.result,res);
				return;
			}
			
			errorres('internal error: no known key in dispatch result - '+line,res);
		}
	});
	
})();
