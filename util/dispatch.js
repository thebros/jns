/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


(function() {

	var TrackException = require('../exceptions/track.js').TrackException;
	var exwrap = require('../exceptions/exwrap.js').exwrap;

	function dispatcher(commands) {
		
		// returns one of :-
		//  {parseerror: message}
		//  {runerror: message}
		//  {result: result}
		var dispatch = exwrap(function dispatch(context,commandline) {
			
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
		});
		
		return dispatch;
	};
	exports.dispatcher = dispatcher;
	
	
	var commands =  {
		testcommand: function(context,command,args) {
			return context+','+command+','+args;
		}
	};
	
	exports.tester = {

		commands: commands,
			
		doalltests: function() {
			var dispatch = dispatcher(commands);
			return [dodispatchtest_succ(dispatch),dodispatchtest_fail(dispatch)];
		}
	};
	
	
	function dodispatchtest_succ(dispatch) {
	
		var context = 'context1';
		var args = 'args1';
		var expected = context+',testcommand,'+args;
		
		var result = dispatch(context,'testcommand '+args);
		
		if ('result' in result) {
			if (result.result != expected) {
				return {fail: {obs: result.result, exp: expected}};
			}
			return {ok: ''};
		}
		
		if ('parseerror' in result) {
			return {fail: {obs: '(parseerror)', exp: expected}};
		}
		
		if ('runerror' in result) {
			return {fail: {obs: '(runerror)', exp: expected}};
		}
		
		throw new TrackException('unrecognized return from \'dispatch\': '+show(result),'dodispatchtest_succ');
	}


	function dodispatchtest_fail(dispatch) {
	
		var context = 'context2';
		var args = 'args2';
		var expected = '(parseerror)'; // not compared directly with result from dispatch
		
		var result = dispatch(context,'boguscommand',args);
		
		if ('result' in result) {
			return {fail: {obs: '(some result)', exp: expected}};
		}
		
		if ('parseerror' in result) {
			return {ok: ''};
		}
		
		if ('runerror' in result) {
			return {fail: {obs: '(runerror)', exp: expected}};
		}
		
		throw new TrackException('unrecognized return from \'dispatch\': '+show(result),'dodispatchtest_fail');
	}

})();
