
(function() {
	
	var wrapper = require('../debugging/wrapper.js');

	exports.logmessage = function(message) {
		console.log(message);
	}
	
	exports.logwrap = function(fun) {
		
		var funname = fun.name;
		
		function handler(calltype,args) {logmessage(funname+" "+calltype+" "+args);}
		
		var handlertable = {
			onwrapexception: handler,
			onbeforecall: handler,
			onaftercall: handler,
			oncallexception: handler
		};
		
		return wrapper.wrapfunction(fun,handlertable);
	}
	
})();
