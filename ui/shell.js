/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {

	var ask = require('../util/ask.js');
	var cc = require('../ui/commandclient.js');
	var logmessage = require('../util/logging.js').logmessage;
	
	exports.interactive = function() {
		
		
		function startask() {
			ask.ask("line",undefined,askcallback,undefined,true);
		}
		
		
		function askcallback(err,result) {
			
			var line;
			
			if (err) {
				logmessage('shell.interactive.error: '+err);
			}
			
			else {
			
				line = result.line;
				
				if (line=='q') {
					// if we don't call startask the process will quit ..
				}
				else {		
					if (line.length) {		
						cc.send(line,sendcallback,false);
						// - this will call startask when it's written the response to stdout
					}
					else {
						startask();
					}
				}
			}
			
			function sendcallback(chunk) {
				var result;
				var report;
				try {
					result = JSON.parse(chunk);
				}
				catch (ex) {
					result = {error: "unable to parse JSON response from server: "+ex.toString()+' ('+chunk+')'};
				}
				if ('error' in result) {
					report = "ERROR: " + result.error;
				}
				else if ('result' in result) {
					report = "RESULT: " + result.result;
				}
				else {
					report = "ERROR: unrecognized response - " + result;
				}
				process.stdout.write(report+'\n');
				startask();
			}
		}
		
		startask();
	}
	
})();
