
exports.isrunningpid = function(pid) {

	var util  = require('util');
	var ps    = require('child_process').spawn('ps', ['ax']);
	var logmessage = require('./util/logging.js').logmessage;

	var regex = /^\s*([0-9]+)\s/mg;
	var matches;
	var found = false;
	ps.stdout.on('data', function (data) {
		
		var datastr = data.toString();
		
		while (matches=regex.exec(datastr)) {
			logmessage("matches[1]=<"+matches[1]+">");
			if (matches[1]==pid) {
				found = true;
			}
		}
	});

	ps.stderr.on('data', function (data) {
	  logmessage('ps stderr:',data.toString());
	});
	
	return found;
};

