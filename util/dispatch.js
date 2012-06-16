/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


(function() {

	var TrackException = require('../exceptions/track.js').TrackException;
	var exwrap = require('../exceptions/exwrap.js').exwrap;
	var testdefs = require('../testing/testdefs.js');

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
			return new testdefs.TestsModuleResult([dodispatchtest_succ(dispatch),dodispatchtest_fail(dispatch)]);
		}
	};
	
	
	// returns a Test object
	function dodispatchtest_succ(dispatch) {
	
		var testname = 'dispatchtest_succ';
		var context = 'context1';
		var args = 'args1';
		var expected = context+',testcommand,'+args;
		
		var result = dispatch(context,'testcommand '+args);
		
		if ('result' in result) {
			if (result.result != expected) {
				return new testdefs.Test(testname,new testdefs.FailOutcome(result.result,expected));
			}
			return new testdefs.Test(testname,new testdefs.OkOutcome());
		}
		
		if ('parseerror' in result) {
			return new testdefs.Test(testname,new testdefs.FailOutcome('(parseerror)',expected));
		}
		
		if ('runerror' in result) {
			return new testdefs.Test(testname,new testdefs.FailOutcome('(runerror)',expected));
		}
		
		throw new TrackException('unrecognized return from \'dispatch\': '+show(result),'dodispatchtest_succ');
	}


	// returns a Test object
	function dodispatchtest_fail(dispatch) {
	
		var testname = 'dispatchtest_fail';
		var context = 'context2';
		var args = 'args2';
		var expected = '(parseerror)'; // not compared directly with result from dispatch
		
		var result = dispatch(context,'boguscommand',args);
		
		if ('result' in result) {
			return new testdefs.Test(testname,new testdefs.FailOutcome('(some result)',expected));
		}
		
		if ('parseerror' in result) {
			return new testdefs.Test(testname,new testdefs.OkOutcome());
		}
		
		if ('runerror' in result) {
			return new testdefs.Test(testname,new testdefs.FailOutcome('(runerror)',expected));
		}
		
		throw new TrackException('unrecognized return from \'dispatch\': '+show(result),'dodispatchtest_fail');
	}

})();
