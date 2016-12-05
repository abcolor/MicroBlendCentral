
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
});

// send data to the device
for (var i = 0; i < 30; i++) {
	var testSendCommand = function(i) {
		var pin = 5;
		var value = i & 1;		
		btService.controlDevice(pin, value);
	}
	setTimeout(testSendCommand, i * 1000, i);
}


