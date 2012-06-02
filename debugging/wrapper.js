/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {
	
	exports.wrapmodule = function(modulename,handler) {

		var wrappingmodule;
		var wrappedmodule;
		var propname;
		var propvalue;
	
		try {
			wrappingmodule = {};
			wrappedmodule = require(modulename);
			for (propname in wrappedmodule) {
				if (wrappedmodule.hasOwnProperty(propname)) {
					propvalue = wrappedmodule[propname];
					if (typeof propvalue == 'function') {
						wrappingmodule[propname] = wrapfunction(propvalue,handler);
					}
				}
			}
		}
		
		catch (ex) {
			handlercall(handler,"onwrapexception",[ex,modulename]);
			throw ex;
		};
		
		return wrappingmodule;
	};
	
	function wrapfunction(fun,handlertable) {
		return function () {
			var result;
			try {
				handlercall(handlertable,"onbeforecall",[arguments]);
				result = fun.apply(this,arguments);
				handlercall(handlertable,"onaftercall",[arguments,result]);
				return result;
			}
			catch (ex) {
				handlercall(handlertable,"oncallexception",[ex,fun.name]);
				throw ex;
			}
		};
	};
	exports.wrapfunction = wrapfunction;
	
	function handlercall(handlertable,calltype,args) {
		if (calltype in handlertable) {
			handlertable[calltype](calltype,args);
		}
	}
})();
