
function TrackException(message,locus) {

	console.log('TrackException: message='+message+', locus='+locus);
	
	if (this==global) {
		throw new Error("TrackException must be called with 'new'")
	}	
	
	this.message = message;
	if (locus) {
		this.message += ' in '+locus;
	}
	this.toString = function() {console.log('TrackException.toString: message='+this.message); return this.message;};
	this.append = function(locus) {this.message += '\n in ' + locus;}
}
exports.TrackException = TrackException;
