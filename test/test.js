var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);


// Test the roaster module.
describe('Roaster', function() {
	var roaster = require('../src/roaster');
	var greenBean = sinon.spy();
	var tempSensor = {
		degF: "299"
	};

	beforeEach(function(){
		roaster.init(greenBean, tempSensor);
	});

	it('preheat should call use the correct temp.', function(done){
		roaster.preheat(300, function() {
			
		});
		done();
	});


	it('Calls callback when preheat complete.', function(done){
		roaster.preheat(300, function() {
			console.log('preheat complete');
			done();
		});
		
		tempSensor.degF = 299;
		tempSensor.degF = 300;
	});

});