
var btService = require("./BlendMicroCentral.js");

btService.startPeripheralScan();

btService.on('connect', function(){
	console.log('bt device is connected');
});

btService.on('disconnect', function(){
	console.log('bt device is disconnected');
});

// retrieve device data
btService.on('data', function(data){
	console.log('bt device data: ' + data.toString('utf-8'));
	var pin = 5;
	var value = data;		
	btService.controlDevice(pin, value);
});

