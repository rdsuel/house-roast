var SPI = require('pi-spi');

var spi0 = SPI.initialize("/dev/spidev0.0");
spi0.clockSpeed(1e6);

var reading = {};
var avg = {
		sum: 0,
		size: 0,
		maxSize: 10,
		avg: 0
};

function calculateAverage(value){
	if (avg.size >= avg.maxSize){
		// Sum is 'full', take an average out.
		avg.sum -= avg.avg;
		avg.size--;
	}

	avg.sum += value;
	avg.size++;
	avg.avg = avg.sum/avg.size;
	
	return(avg.avg);
};



function readTc(spi) {
	spi.read(4, function(err, data) {
		if (err) {
			console.log("Error reading from SPI port. " + err);
			callback();
		}

		var buf = new Buffer(data);

		var temp = buf.readInt16BE(0) / 16;
		var hundreths = ((data[1] >> 2) & 0x03) * 0.25;
		temp = temp + hundreths;

		reading.tempC = temp;
		reading.tempF = (temp * 9 / 5) + 32;

		reading.fault = data[1] & 0x01;
		reading.scvFault = (data[3] & 0x04) >> 2;
		reading.scgFault = (data[3] & 0x02) >> 1;
		reading.ocFault = data[3] & 0x01;

		var refHunds = (buf.readInt8(3) / 16) * 0.0625;
		var refTemp = buf.readInt8(2) + refHunds;
		
		// Create an average tempF.
		calculateAverage(reading.tempF);
	});
}

exports.start = function(interval){
	setInterval(function() {
		readTc(spi0);
	}, interval);
}

exports.read = function(){
	return avg.avg;
};
