var express = require('express');
var router = express.Router();
var roaster = require('../../engine.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/connect', function(req, res){
	roaster.connect();
	res.status(200).send("Connected");
});

router.get('/preheat', function(req, res){
	var temp = req.query.temp;
	roaster.preheat(temp);
	res.status(200).send("Preheating to "+temp);
});

router.get('/roast', function(req, res){
	var p1power = req.query.p1power;
	var p1temp = req.query.p1temp;
	var p2power = req.query.p2power;
	var p2temp = req.query.p2temp;
	
	roaster.roast(p1power, p1temp, p2power, p2temp);
	res.status(200).send("Roast started");
});

router.get('/stop', function(req, res){
	roaster.stop();
});

router.get('/status', function(req, res){
	var status = roaster.getStatus();
	res.send(status);
});

router.get('/test', function(req, res){
	roaster.test();
});

module.exports = router;
