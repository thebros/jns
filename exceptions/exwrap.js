
exports.exwrap = function(fun) {

	var TrackException = require('./track.js').TrackException;
	
	return function() {
		try {
			return fun.apply(this,arguments);
		}
		catch (ex) {
			console.log('exwrap: '+ex.message);
			if (ex.constructor == TrackException) {
				throw ex.append(fun.name);
			}
			throw new TrackException(ex.message,fun.name);
		}
	}
}