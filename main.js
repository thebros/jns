/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// jns - main module

(function() {
	
	var logging = require('./util/logging.js');
	var logwrap = logging.logwrap;
	var logmessage = logging.logmessage;
	var TrackException = require('./exceptions/track.js').TrackException;
	
	var jns = {};

	jns.shuttingdown = false;
	jns.unavailable = function(funname) {throw new TrackException('Function "'+funname+'" is not available at this time','main');}

	jns.spawn = require('child_process').spawn;

	logmessage('main.startup.info: loading subsystems');
	load_subsystems();
		
	jns.control = require('./main/control.js');
	jns.control.init(jns);
	
	jns.bindir = process.cwd();

	jns.webroot = jns.bindir;

	(function mainfunction() {
	
		jns.control.startCommandServer(jns.webroot,9913);
		jns.control.startWebServer(jns.webroot,9914);
		
		logmessage('main.startup.info: principal startup');
		startup();
	
		logwrap(mainloop);
	})();


	function mainloop() {
	
	}


	function startup() {
		//startwatchdog(process.pid);
	}
	

	function startwatchdog(ppid) {
		jns.spawn("node watchdog.js",[ppid],{cwd: jns.bindir})
	}


	function load_subsystems() {
		var subsystems = ["registry","messaging","scheduler"];
		var ss;
		for (var s in subsystems) {
			ss = subsystems[s];
			logmessage('main.startup.subsystems.info: loading '+ss);
			jns[ss] = new require('./subsystem/'+ss+'.js').Subsystem(jns);
		}
	}


	exports.jns = jns;
	
})();

