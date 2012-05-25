
(function() {

	var registry_idpath = 'sys.registry';
	
	exports.Subsystem = function(jns) {
		this.jns = jns;
		this.registry = {};
		this.register = register;
		this.unregister = unregister;
		this.send = send;
		this.dump = dump;
		this.broadcast = broadcast;
		this.messagehandler = messagehandler;
		this.registry[registry_idpath] = bindx(this,messagehandler);
		function bindx(thisx,methodx) {
			return function() {
				return methodx.apply(thisx,arguments);
			}
		}
		return this;
	}

	function identify_message(dest) {
		return {source: registry_idpath, dest: dest, messagetype: 'basic.identify'}
	}
	
	// handler.message should take (idpath,message) as parameters
	function register(idpath,handler) {
		if (typeof handler == 'undefined') {
			this.jns.subsystem_error('registry.register','handler not defined');
		}
		if (typeof this.registry[idpath] != 'undefined') {
			console.log(typeof this.registry[idpath]);
			this.jns.subsystem_warning('registry.register','key already in registry: '+idpath);
		}
		this.registry[idpath] = handler;
	}
	
	function unregister(idpath) {
		if (typeof this.registry[idpath] == 'undefined') {
			this.jns.subsystem_warning('registry.unregister','key not in registry: '+idpath);
		}
		else {
			delete this.registry[idpath];
		}
	}
	
	function send(idpath,message) {
	
		var that = this;
		
		if (! idpath) {
			this.jns.subsystem_error('registry.send','empty idpath passed to send');
		}
		
		var dest = idpath;
		var result;
		
		do {
			
			if (result = sendto(dest,idpath,message)) {
				return result.result;
			}
			
			dest = withoutlast(dest);
		} while (dest);
		
		this.jns.subsystem_error('registry.send','key not in registry: '+idpath);
		
		function sendto(dest,idpath,message) {		
			console.log('registry trying "'+dest+'"');	
			var handler = that.registry[dest];
			if (typeof handler == 'undefined') {
				return null;
			}
			return {result: handler(idpath,message)};
		}
		
		function withoutlast(s) {
			var poslastdot = s.lastIndexOf('.');
			if (poslastdot == -1) {
				return '';
			}
			else {
				return s.substring(0,poslastdot);
			}
		}
	}
	
	function broadcast(idpathprefix,message) {
		
		var regex = /: unknown message - /; // a hack, should subclass Error
		var idpath;
		for (idpath in this.registry) {
			if (idpath.substring(0,idpathprefix.length-1) == idpathprefix) {
				try {
					this.send(idpath,message);
				}
				catch(ex) {
					if (!(ex.match(regex))) {
						throw ex;
					}
				}
			}
		}
	}
	
	function dump() {
		
		var result = "";
		var idpath;
		for (idpath in this.registry) {
			result += (idpath+"="+this.registry[idpath](idpath,identify_message(idpath))+'\n');
		}
		
		return result;
	}
	
	function messagehandler(idpath,message) {
		this.jns.messaging.noforeignidpath(idpath,registry_idpath);
		if (message.messagetype == 'basic.identify') {
			return 'System Registry';
		}
		else {
			throw new Error(registry_idpath+': unknown message - '+message.messagetype);
		}
	}
	
})();

