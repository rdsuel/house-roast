var fctInterval = {};
var periodInterval = {};
var elementTimeout = {};
var tempCheckInterval = {};
var period = 10000;
var elementOnTime = 100;
var element = 48; // 11 = Bake, 12 = Broil, 48 = Convect

function enterFCT(range){
    range.fctMode.write(1);

    // Periodically assert FCT mode so it doesn't exit.
    clearInterval(fctInterval);
    fctInterval = setInterval(function() {
        range.fctMode.write(1);
    }, 15000);
}

module.exports.preheat = function(range, sensor, temp, callback){
	
	var actualTemp = 0;
	
    // Enter FCT.
    enterFCT(range);

    // Monitor to see when we are preheated.
    clearInterval(tempCheckInterval);
    tempCheckInterval = setInterval(function(){
    	actualTemp = sensor.read();
    	console.log("preheat actual temp: ", actualTemp);
        if (actualTemp < (temp - 5))
        {
            // Turn the element on.
            range.elementStatus.write({
                upperOvenElementStatus: 0,
                lowerOvenElementStatus: 11
            });        
        }
        else 
        {
        	// Preheated!
        	callback();
            // Turn the element off.
            range.elementStatus.write({
                upperOvenElementStatus: 0,
                lowerOvenElementStatus: 0
            });        
        }
    }, 1000);

};

exports.roast = function(range, sensor, roastPhase, callback){
    
	var actualTemp = 0;
	
    // Enter FCT.
    enterFCT(range);

    console.log(sensor);
    clearInterval(tempCheckInterval);
    tempCheckInterval = setInterval(function(){
    	actualTemp = sensor.read();
    	
    	if (actualTemp >= roastPhase.temp)	{
    		console.log("Oven temp: ", actualTemp);
    		callback();
    	}
    }, 500);

    // Turn the convection fan on.
    range.convectionFan.write({
        upperOvenConvectionFanDrivePercentage: 0,
        upperOvenConvectionFanRotation: 0,
        lowerOvenConvectionFanDrivePercentage: 100,
        lowerOvenConvectionFanRotation: 0
    });

    // Calculate the on time based on the power.
    elementOnTime = (roastPhase.power * period)/100;

    // Run the elements based on the roast power.
    periodInterval = setInterval(function() {
	    range.elementStatus.write({
       		upperOvenElementStatus: 0,
        	lowerOvenElementStatus: element
    	});
        
	    elementTimeout = setTimeout(function() {
		    range.elementStatus.write({
   				upperOvenElementStatus: 0,
    			lowerOvenElementStatus: 0
	    	});
	    },elementOnTime);
    },period);	
};

exports.stop = function(range){
	console.log("stopped");
	// Stop all running timers.
	clearInterval(fctInterval);
	clearInterval(tempCheckInterval);
	clearInterval(periodInterval);
	clearTimeout(elementTimeout);

	// Turn off the element.
	range.elementStatus.write({
		upperOvenElementStatus: 0,
		lowerOvenElementStatus: 0
	});

	// Turn off the convection fan.
    range.convectionFan.write({
        upperOvenConvectionFanDrivePercentage: 0,
        upperOvenConvectionFanRotation: 0,
        lowerOvenConvectionFanDrivePercentage: 0,
        lowerOvenConvectionFanRotation: 0
    });

    // Turn off the light and exit FCT mode.
    range.fctMode.write(0);
};

exports.test = function(range){
    console.log(range); 
    range.fctMode.write(1); // enter fct mode

    setInterval(function() {
        console.log("re-assert FCT mode");
        range.fctMode.write(1); // stay in fct mode
    }, 2000);
};