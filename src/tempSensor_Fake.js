var reading = 0;
var pollRate = 0;

exports.start = function(rate){
	pollRate = rate;
}

exports.setFakeTemp = function(range, temp, degPerSec){
	setInterval(function(){
		reading += (degPerSec*pollRate)/1000;
	}, pollRate);
}

exports.read = function(){
	return reading;
};