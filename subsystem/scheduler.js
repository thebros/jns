
(function() {
	
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
			this.jns.subsystem_error('scheduler.schedule','handler not defined');
		}
		if (typeof this.scheduletable[idpath] != undefined) {
			this.jns.subsystem_warning('scheduler.schedule','key already in schedule: '+idpath);
		}
		this.scheduletable[idpath] = {
			ticksInterval: interval,
			ticksRemaining: interval,
			taskHandler: handler
		};
	}
	
	function unschedule(idpath) {
		if (typeof this.scheduletable[idpath] == 'undefined') {
			this.jns.subsystem_warning('scheduler.unschedule','key not in schedule: '+idpath);
		}
		else {
			delete this.scheduletable[idpath];
		}
	}
	
	function once() {
		for (var idpath in this.scheduletable) {
			if (this.scheduletable.hasOwnProperty(idpath)) {
				var task = this.scheduletable[idpath];
				if (!(task.ticksRemaining--)) {
					task.ticksRemaining = task.ticksInterval;
					try {
						task.taskHandler(idpath,{messagetype:".once", messageargs: []});
					}
					catch (err) {
						this.jns.subsystem_error('scheduler.once: error running task '+idpath+' - '+err.toString());
					}
				}
			}
		}
	}
	
})();

