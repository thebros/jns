
(function() {
	
	var prompt = require('prompt');
	
	exports.ask = function(question,format,callback,warningmessage,allowempty) {
		
		if (typeof warningmessage == 'undefined') {
			warningmessage = "Invalid input";
		}
		
		if (typeof allowempty == 'undefined') {
			allowempty = false;
		}
		
		var properties = [
			{
				name: question, 
				warning: warningmessage,
				empty: allowempty
			},
		];
		
		if (typeof format != 'undefined') {
			properties.validator = format;
		}

		prompt.start();

		prompt.get(properties, callback);
	}
	
	exports.pause = function() {
		prompt.pause();
	}
	
})()

