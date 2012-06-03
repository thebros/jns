/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {
	
	var util = require('util');
	var wrapper = require('../debugging/wrapper.js');

	var allregex = /(^\| )|(\berror\b)/;
	var filterregex = null;
	
	exports.logmessage = function(message) {
		if (filter(message)) {
			console.log(message);			
		}
	};
	
	exports.setfilter = function(thefilterregex) {
		
		switch (typeof thefilterregex) {
			case 'string':
				if (thefilterregex == 'all') {
					filterregex = null;
				}
				else {
					filterregex = new RegExp(thefilterregex);
				}
				return;
			case 'object':
				if (thefilterregex && thefilterregex.constructor==RegExp) {
					filterregex = thefilterregex;
					return;
				}
		};
		
		console.log('illegal call to setfilter: '+thefilterregex);
	}
	
	exports.currentfilter = function() {
		if (filterregex) {
			return filterregex.source;
		}
		else {
			return 'ALL';
		}
	}
	
	exports.show = function(value) {
		return util.inspect(value,true,2,true);
	}
	
	exports.logwrap = function(fun) {
		
		var funname = fun.name;
		
		function handler(calltype,args) {logmessage('logwrap.trace: '+funname+" "+calltype+" "+args);}
		
		var handlertable = {
			onwrapexception: handler,
			onbeforecall: handler,
			onaftercall: handler,
			oncallexception: handler
		};
		
		return wrapper.wrapfunction(fun,handlertable);
	};
	
	function filter(message) {
		return !filterregex || allregex.test(message) || filterregex.test(message);
	}
	
})();
