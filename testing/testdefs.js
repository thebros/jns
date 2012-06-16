/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


(function() {

	var path = require('path');
	
	var TrackException = require('../exceptions/track.js').TrackException;


	// TestModule:
	//  modulepath: string
	//  moduleresult: TestsModuleResult | WarningModuleResult | ErrorModuleResult
	//
	// created by runtests.testmodule
	exports.TestModule = function(modulepath,moduleresult) {
		
		if (this==global) {
			throw new TrackException("TestModule must be called with 'new'",'testing.TestModule');
		}

		this.modulepath = modulepath;
		this.moduleresult = moduleresult;
		
		this.report = function(format) {
			var testoutcome = this.moduleresult.report(format);
			if (testoutcome) {
				return this.modulepath+'\n'+testoutcome+'\n';
			}
			else {
				return '';
			}
		};
		
		return this;
	}
	
	
	// TestsModuleResult:
	//  testresults: [Test]
	//
	// created by specific test module
	exports.TestsModuleResult = function(testresults) {
		
		if (this==global) {
			throw new TrackException("TestsModuleResult must be called with 'new'",'testing.TestsModuleResult');
		}

		this.testresults = testresults;
		
		this.report = function(format) {
			var out = '';
			var testoutcome;
			for (var r in this.testresults) {
				testoutcome = this.testresults[r].report(format);
				if (testoutcome) {
					out += ' '+testoutcome+'\n';
				}
			}
			return out;
		};
		
		return this;
	};
	

	// WarningModuleResult:
	//  message: string
	//
	// created by specific test module
	exports.WarningModuleResult = function(message) {
		
		if (this==global) {
			throw new TrackException("WarningModuleResult must be called with 'new'",'testing.WarningModuleResult');
		}

		this.message = message;
		
		this.report = function(format) {
			switch (format) {
				case 'minimal': return '';
				default: return '';
			}
		};
		
		return this;
	}


	// ErrorModuleResult:
	//  message: string
	//
	// created by specific test module
	exports.ErrorModuleResult = function(message) {
		
		if (this==global) {
			throw new TrackException("ErrorModuleResult must be called with 'new'",'testing.ErrorModuleResult');
		}

		this.message = message;
		
		this.report = function(format) {
			return 'error: '+this.message;
		};
		
		return this;
	}
	
	
	// Test:
	//  name: string
	//  outcome: OkOutcome | FailOutcome
	//
	// created by specific test in module
	exports.Test = function(name,outcome) {
		
		if (this==global) {
			throw new TrackException("Test must be called with 'new'",'testing.Test');
		}

		this.name = name;
		this.outcome = outcome;
		
		this.report = function(format) {
			var outcomereport = this.outcome.report(format);
			switch (format) {
				case 'minimal':
					if (outcomereport) {
						return this.name+' '+outcomereport;
					}
					else {
						return '';
					}
				default: return this.name+' '+outcomereport;
			}
		};
		
		return this;
	}
	
	
	// OkOutcome
	//
	// created by specific test in module
	exports.OkOutcome = function() {
		
		if (this==global) {
			throw new TrackException("OkOutcome must be called with 'new'",'testing.OkOutcome');
		}

		this.report = function(format) {
			switch (format) {
				case 'minimal': return '';
				default: return 'ok';
			}
		};
		
		return this;
	}
	
		
	// FailOutcome:
	//  obs: string
	//  exp: string
	//
	// created by specific test in module
	exports.FailOutcome = function(obs,exp) {
		
		if (this==global) {
			throw new TrackException("FailOutcome must be called with 'new'",'testing.FailOutcome');
		}

		this.obs = obs;
		this.exp = exp;
		
		this.report = function(format) {
			switch (format) {
				case 'minimal': return 'fail';
				default: return 'fail ('+obs+' <> '+exp+')';
			}
		};
		
		return this;
	}
	
	
})();
