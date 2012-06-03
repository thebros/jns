/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {

	var TrackException = require('../exceptions/track.js').TrackException;
	var exwrap = require('../exceptions/exwrap.js').exwrap;
	
	exports.Subsystem = function(jns) {
		this.jns = jns;
		this.scheduletable = {};
		this.schedule = schedule;
		this.unschedule = unschedule;
		this.once = once;
		return this;
	}
	
	// handler.message should take (idpath,message) as parameters
	function schedule(idpath,interval,handler) {
		if (typeof handler == 'undefined') {
			throw new TrackException('given handler is undefined','scheduler.schedule');
		}
		if (typeof this.scheduletable[idpath] != undefined) {
			throw new TrackException('key already in schedule: '+idpath,'scheduler.schedule');
		}
		this.scheduletable[idpath] = {
			ticksInterval: interval,
			ticksRemaining: interval,
			taskHandler: handler
		};
	}
	
	function unschedule(idpath) {
		if (typeof this.scheduletable[idpath] == 'undefined') {
			throw new TrackException('key not in schedule: '+idpath,'scheduler.unschedule');
		}
		else {
			delete this.scheduletable[idpath];
		}
	}
	
	var once = exwrap(function once() {
		for (var idpath in this.scheduletable) {
			if (this.scheduletable.hasOwnProperty(idpath)) {
				var task = this.scheduletable[idpath];
				if (!(task.ticksRemaining--)) {
					task.ticksRemaining = task.ticksInterval;
					try {
						task.taskHandler(idpath,{messagetype:".once", messageargs: []});
					}
					catch (err) {
						throw new TrackException('error running task '+idpath+' - '+err.toString(),'scheduler.once');
					}
				}
			}
		}
	});
	
})();

