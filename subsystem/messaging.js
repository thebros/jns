
(function() {
	
	exports.Subsystem = function(jns) {
		this.jns = jns;
		this.send = send;
		this.noforeignidpath = noforeignidpath;
		return this;
	}

	// not currently used - and not all currently implemented	
	messages = ['basic.identify','basic.dump','basic.status','basic.shutdown'];

	function send(sender,target,message) {
		
	}
	
	function noforeignidpath(idpath,ownidpath) {
		if (idpath != ownidpath) {
			throw new Error('Handler for "'+ownidpath+'" does not support messages for subids');
		}
	}
	
})();

