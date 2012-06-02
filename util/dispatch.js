/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


(function() {

	var TrackException = require('../exceptions/track.js').TrackException;
	
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
				var r = line.match(/^(\S+)\s+(.*)?$/);
				if (!r) {
					throw new TrackException('Unrecognized command-line format','dispatch');
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

})();
