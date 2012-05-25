

exports.dispatcher = function(commands) {
	
	// returns one of :-
	//  {parseerror: message}
	//  {runerror: message}
	//  {result: result}
	function dispatch(context,commandline) {
		
		function parseline(line) {
			if (! line.match(/\s/)) {
				line += ' ';
			}
			var r = line.match(/^(\S+)\s+((.*))?$/);
			if (!r) {
				throw new Error("Unrecognized command-line format")
			}
			return {command: r[1], args: r[2]};
		}
		
		try {
			var parts = parseline(commandline);
		}
		catch (ex) {
			return {parseerror: ex.toString()};
		}
		
		if (!(parts.command in commands)) {
			return {parseerror: "Unrecognized command: "+parts.command};
		}
		
		try {
			return {result: commands[parts.command](context,parts.command,parts.args)};
		}
		catch (ex) {
			return {runerror: ex.toString()};
		}
	}
	
	return dispatch;
};
