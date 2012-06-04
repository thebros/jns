/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


(function() {

	exports.TrackException = function (message,locus) {
	
		if (this==global) {
			throw new Error("TrackException must be called with 'new'")
		}	
	
		if (typeof message=='object' && message) {
			this.innerexception = message;
		}
		else {
			this.innerexception = new Error(message);
		}
	
		this.message = '';	
		if (locus) {
			this.message += " in '"+locus+"'";
		}
		
		this.toString = function() {
			return this.innerexception.toString()+this.message;
		};
		
		this.append = function(message,locus) {
			this.message += '\n';
			if (message || locus) {
				if (message) {
					this.message += message;
				}
				if (locus) {
					this.message += " in '"+locus+"'";
				}
			}
			else {
				this.message += '(no information for this frame)';
			}					
		}
	}
})();
