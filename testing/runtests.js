/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


(function() {

	var fs = require('fs');
	var path = require('path');
	
	var TrackException = require('../exceptions/track.js').TrackException;
	var testdefs = require('./testdefs.js');	
	
	
	// returns an object keyed by filepath with TestModule values
	exports.testsubtree = function(subtreepath) {
	
		var subtreeresults = {};
		testsubtree_impl(subtreepath,subtreeresults);
		return subtreeresults;
	
		function testsubtree_impl(filepath,results)	{
		
			var stats = fs.statSync(filepath);
			
			if (stats.isFile() && path.extname(filepath).toUpperCase()=='.JS') {
				results[filepath] = testmodule(filepath);
				return;
			}
			
			if (stats.isDirectory()) {
				testsubtree_impl_dir(filepath,results);
				return;
			}
			
			// (if it's not a file or a dir: ignore it)
		}
		
		function testsubtree_impl_dir(filepath,results) {
			var files = fs.readdirSync(filepath);
			for (var f in files) {
				testsubtree_impl(path.join(filepath,files[f]),results);
			}
		}
	}
	
	
	// returns a TestModule object
	function testmodule(modulepath) {
	
		var m;
		var tester;
		var testresult;
		
		try {
			m = require(modulepath);
		}
		catch (ex) {
			return new testdefs.TestModule(modulepath,new testdefs.ErrorModuleResult(ex.toString()));
		}
		
		tester = m.tester;
		if (typeof tester == 'undefined') {
			return new testdefs.TestModule(modulepath,new testdefs.WarningModuleResult('module exports no \'tester\' property'));
		}
		
		try {
			testresults = capture(function() {
				return new testdefs.TestModule(modulepath,tester.doalltests()); // doalltests should return a XxxModuleResult object
			});
		}
		catch (ex) {
			return new testdefs.TestModule(modulepath,new testdefs.ErrorModuleResult(ex.toString()));
		}

		return testresults.result;
	};
	exports.testmodule = testmodule;
	
	
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
			var testname = singleresult.name;
			if ('ok' in singleresult) {
				return testname+' OK';
			}
			var failure = singleresult.fail;
			return testname+' *FAIL* ('+failure.obs+' <> '+failure.exp+')';
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
