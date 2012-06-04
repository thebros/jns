/*
Copyright (c) 2012 Andrew Cheshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {

	var registry_idpath = 'sys.registry';
	var TrackException = require('../exceptions/track.js').TrackException;
	var UnknownMessage = require('../exceptions/sys.js').UnknownMessage;
	var exwrap = require('../exceptions/exwrap.js').exwrap;

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
			throw new TrackException('handler not defined','registry.register');
		}
		if (typeof this.registry[idpath] != 'undefined') {
			throw new TrackException('key already in registry: '+idpath,'registry.register');
		}
		this.registry[idpath] = handler;
	}
	
	function unregister(idpath) {
		if (typeof this.registry[idpath] == 'undefined') {
			throw new TrackException('key not in registry: '+idpath,'registry.unregister');
		}
		else {
			delete this.registry[idpath];
		}
	}
	
	var send = exwrap(function send(idpath,message) {
	
		var that = this;
		
		if (! idpath) {
			throw new TrackException('empty idpath passed to send','registry.send');
		}
		
		var dest = idpath;
		var result;
		
		do {
			
			if (result = sendto(dest,idpath,message)) {
				return result.result;
			}
			
			dest = withoutlast(dest);
		} while (dest);
		
		throw new TrackException('key not in registry: '+idpath,'registry.send');
		
		function sendto(dest,idpath,message) {		
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
	});
	
	function broadcast(idpathprefix,message) {
		
		var idpath;
		for (idpath in this.registry) {
			if (idpath.substring(0,idpathprefix.length-1) == idpathprefix) {
				try {
					this.send(idpath,message);
				}
				catch(ex) {
					if (typeof ex=='object' && ex && ex.constructor == UnknownMessage) {
						// ignore unknown-message exceptions
					}
					else {
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
			throw new UnknownMessage(message.messagetype,registry_idpath);
		}
	}
	
})();

