
// jns - main module

(function() {
	
	var logwrap = require('./util/logging.js').logwrap;
	
	var jns = {};
	jns.logmessage = console.log;

	jns.shuttingdown = false;
	jns.unavailable = function(funname) {throw new Error('Function "'+funname+'" is not available at this time');}

	jns.spawn = require('child_process').spawn;

	jns.logmessage('- loading subsystems');
	load_subsystems();
		
	jns.control = require('./main/control.js');
	jns.control.init(jns);
	
	jns.bindir = process.cwd();

	jns.webroot = jns.bindir;

	(function mainfunction() {
	
		jns.control.startCommandServer(jns.webroot,9913);
		jns.control.startWebServer(jns.webroot,9914);
		
		jns.logmessage('- startup');
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


	jns.subsystem_error = function(subsystem,mess) {
		jns.logmessage("ERROR: "+subsystem+" - "+mess);
	}


	jns.subsystem_warning = function(subsystem,mess) {
		jns.logmessage("WARNING: "+subsystem+" - "+mess);
	}


	function load_subsystems() {
		var subsystems = ["registry","messaging","scheduler"];
		var ss;
		for (var s in subsystems) {
			ss = subsystems[s];
			jns.logmessage('-- '+ss);
			jns[ss] = new require('./subsystem/'+ss+'.js').Subsystem(jns);
		}
	}


	exports.jns = jns;
	
})();

