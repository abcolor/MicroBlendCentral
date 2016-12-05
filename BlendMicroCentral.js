var winston = require('winston');
var noble = require('noble');

var serviceUUID = '713d0000503e4c75ba943148f18d941e'
var characteristicControlUUID = '713d0003503e4c75ba943148f18d941e'
var characteristicGetDataUUID = '713d0002503e4c75ba943148f18d941e'

var events = require('events');
var eventEmitter = new events.EventEmitter();

//winston.level = 'debug';

var characteristicControl = null;

exports.startPeripheralScan = function() {
	noble.on('stateChange', function(state) {
		if (state === 'poweredOn') {
			//noble.startScanning();
			noble.startScanning([serviceUUID], true);			
			winston.log('info', 'bt server start scan');
		}
		else {
			noble.stopScanning();
			winston.log('info', 'bt server stop scan');
		}
	});	
};


exports.on = function(event, handler) {	
	eventEmitter.on(event, handler);
}

exports.controlDevice = function(pin, value) {
	if(characteristicControl) {
		var command = pin.toString() + value.toString()
		characteristicControl.write(new Buffer(command));			      		
	}	
};


noble.on('discover', function(peripheral) {

	winston.log('debug', 'on -> discover: ' + peripheral);
	console.log('discover...');
	noble.stopScanning();

  	peripheral.once('connect', function() {
    	winston.log('debug', 'on -> connect');
    	
    	this.discoverServices();
    	
    	eventEmitter.emit('connect');
  	});

  	peripheral.once('disconnect', function() {
    	winston.log('debug', 'on -> disconnect');

    	eventEmitter.emit('disconnect');

    	this.disconnect()

    	console.log('reconnecting...');

  		noble.stopScanning();
		noble.startScanning([serviceUUID], true);			
  	});

  	peripheral.once('rssiUpdate', function(rssi) {    	
    	winston.log('debug', 'on -> RSSI update ' + rssi);
    	
  	});

  	peripheral.once('servicesDiscover', function(services) {

  		winston.log('debug', 'on -> peripheral services discovered ' + services);    	
    	
    	services.forEach(function(service, index, services) {		        		
		    //console.log('     service UUID ' + service.uuid);

		    if(service.uuid === serviceUUID) {

		    	//console.log('     service UUID ' + service.uuid);
				
				winston.log('debug', 'found ForceWatch service');

		    	service.once('includedServicesDiscover', function(includedServiceUuids) {		      		
		      		winston.log('debug', 'on -> service included services discovered ' + includedServiceUuids);
		      		this.discoverCharacteristics();
		    	});

		    	service.once('characteristicsDiscover', function(characteristics) {

		    		winston.log('debug', 'on -> service characteristics discovered ' + characteristics);		      		

		      		characteristics.forEach(function(characteristic, index, characteristics) {
						//console.log('     characteristic UUID ' + characteristic.uuid);

						//  characteristicControl...
						if(characteristic.uuid === characteristicControlUUID) {
							characteristicControl = characteristic;
						}

						//  characteristicGetData...
						if(characteristic.uuid === characteristicGetDataUUID) {

							winston.log('debug', 'start to use characteristicGetData');																				
							
							characteristic.on('read', function(data, isNotification) {
								winston.log('debug', 'on -> characteristic [' + characteristic.uuid + '] read ' + data.toString('utf-8') + ' ' + isNotification);
				        		eventEmitter.emit('data', data);				        					        		
				      		});

				      		characteristic.on('notify', function(state) {
				      			winston.log('debug', 'on -> characteristic notify ' + state);				        						        		
				      		});

				      		characteristic.notify(true);				      		
						}
						
		      		});
		      		
		    	});

				service.discoverIncludedServices();
		    }
		    
		});
  	});
	console.log('peripheral connect...');
  	peripheral.connect();	
  	
});