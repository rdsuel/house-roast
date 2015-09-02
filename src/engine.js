var oven = require('./oven.js');
var greenBean = require('green-bean');
var tempSensor = require('./tempSensor.js')
//var tempSensor = require('./tempSensor_Fake.js')
var gbRange = {};
var roastPhase1 = {
	power: 75,
	temp: 390
};
var roastPhase2 = {
	power: 50,
	temp: 430
};
var status = {
	connected: "not connected", 
	state: "stopped",
	targetTemp: 0,
	actualTemp: 0,
	powerLevel: 0
};
var testInterval = {};

exports.connect = function(){
	if(status.connected == "not connected"){
		console.log("connecting ...");
		status.connected = "connecting";
		
		// Start polling the temperature sensor.
		tempSensor.start(500);

		greenBean.connect("range", function(range){
			// Save the range instance for later use.
			gbRange = range;
			// Update the status.
			status.connected = true;
			// Update the status.
			status.connected = "connected";
			console.log("conneted!");
		});
	}
};

exports.preheat = function(temp){
	// if(status.connected) {
//		tempSensor.setFakeTemp(temp, 5);

		status.state = "preheating";
		status.targetTemp = temp;
		status.powerLevel = 100;

		// Start preheating.
		oven.preheat(gbRange, tempSensor, temp, function(){
			// Preheat complete.
			status.state = "ready to roast";
			status.targetTemp = temp;
		});	
	// }
};

exports.roast = function(phase1Power, phase1Temp, phase2Power, phase2Temp){
	//if (status.connected) {
		console.log("roasting");
		// Store the roast phases.
		roastPhase1.power = phase1Power;
		roastPhase1.temp = phase1Temp;
		roastPhase2.power = phase2Power;
		roastPhase2.temp = phase2Temp;

		// Testing
		testInterval = setInterval(function(){
			tempSensor.degF+=5;
		}, 1000);

		// Update the status.
		status.state = "roasting - phase 1";
		status.targetTemp = phase1Temp;
		status.powerLevel = phase1Power;

		// Begin phase 1 roast.
		oven.roast(gbRange, tempSensor, roastPhase1, function(){
			oven.stop(gbRange);
			// Phase 1 complete, update the status for phase 2.
			status.state = "roast phase 2";
			status.targetTemp = phase2Temp;
			status.powerLevel = phase2Power;

			// Run phase 2.
			oven.roast(gbRange, tempSensor, roastPhase2, function(){
				oven.stop(gbRange);
				// Phase 2 complete.
				status.state = "complete";
				status.targetTemp = 0;
				status.powerLevel = 0;
			});
		});
	//}
};

exports.stop = function(){
	// Testing
	clearInterval(testInterval);
	tempSensor.degF = 300;

	console.log("stopped");
	oven.stop(gbRange);
	status.state = "stopped";
	status.targetTemp = 0;
	status.powerLevel = 0;	
};

exports.getStatus = function(){
	console.log("status requested");
	// Update the temperature sensor here.
	status.actualTemp = tempSensor.read();
	return(status);
};

exports.test = function(){
	oven.test(gbRange);
};

