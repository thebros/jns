/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


// if a test succeeds: {ok: ''}
// if a test fails: {fail: {obs: OBSERVED, exp: EXPECTED}};
(function() {


	exports.testmodule = function(modulepath) {
	
		var m;
		var tester;
		var testresult;
		
		try {
			m = require(modulepath);
		}
		catch (ex) {
			return {error: ex.toString(), modulepath: modulepath, where: 'require'};
		}
		
		tester = m.tester;
		if (typeof tester == 'undefined') {
			return {warning: 'no \'tester\' property', modulepath: modulepath, where: 'get tester'};
		}
		
		try {
			testresults = capture(function() {return tester.doalltests();});
		}
		catch (ex) {
			return {error: ex.toString(), modulepath: modulepath, where: 'runtest'};
		}

		return {results: testresults, modulepath: modulepath};
	};
	
	
	exports.modulereport = function(testoutcome) {
	
		var header = testoutcome.modulepath+': ';
		
		if ('results' in testoutcome) {
			return header+testresultsreport(testoutcome.results);
		}
		
		if ('warning' in testoutcome) {
			return header+'warning - '+testoutcome.warning;
		}
		
		if ('error' in testoutcome) {
			return header+'error - '+testoutcome.error;
		}
		
		return '??? unknown testoutcome format';
		
		function testresultsreport(testresults) {
			var out = '';
			for (result in testresults.result) {
				if (out) {
					out += ', ';
				}
				out += singleresultreport(testresults.result[result]);
			}
			return out;
		}
		
		function singleresultreport(singleresult) {
			if ('ok' in singleresult) {
				return 'ok';
			}
			var failure = singleresult.fail;
			return 'fail ('+failure.obs+' <> '+failure.exp+')';
		}
	}
	
	
	function capture(fun) {
	
		var oldlog = console.log;
		var loglines = [];
		var result;
		
		try {
			console.log = newlog;
			result = fun();
			return {result: result, loglines: loglines};
		}
		catch (ex) {
			return {error: ex.toString(), loglines: loglines};
		}
		finally {
			console.log = oldlog;
		}
		
		function newlog() {
			newloglines.push(arguments.join(' '));
		}
	}
	exports.capture = capture;
	
})();
