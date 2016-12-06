#include <SPI.h>
#include <boards.h>
#include <RBL_nRF8001.h>
#include <services.h>

#define TIC_TIME        15 // ms

//====================================================================================================================

int buttonState = 0;         // variable for reading the pushbutton status

void setup() {
    ble_begin(); // int BLE 
    
    pinMode(3, OUTPUT);     
    pinMode(5, OUTPUT);     
    pinMode(8, OUTPUT);     
    pinMode(9, INPUT);        
    
    Serial.begin(57600);
}

//__________________________________________________________________________________________________________________

void loop(){          
    checkBluetoothEvent();  
    checkButtonEvent();
    delay(TIC_TIME);
}

void checkButtonEvent() {
  // read the state of the pushbutton value:
  int state = digitalRead(9);

  if(state!=buttonState) {
    buttonState = state;
    
    // check if the pushbutton is pressed.
    // if it is, the buttonState is HIGH:
    if (buttonState == HIGH) {     
      ble_write(49);   
    } 
    else {
      ble_write(48);   
    }
  }
}

//__________________________________________________________________________________________________________________

void checkBluetoothEvent() {
  
  static int prevCommand = 99;
  static int prevValue = 99;
  static byte prevBluetoothState = 0;
  static int previousMode = 0;

  // If data is ready
  while(ble_available())
  { 
    // read out command and data
    int pin = ble_read() - 48;
    Serial.print("pin: ");
    Serial.println(pin);
    
    int value = ble_read() - 48;
    Serial.print("value: ");
    Serial.println(value);
    
    digitalWrite(pin, value);
  }   
  
  // check connection status
  byte bluetoothState = ble_connected();
  
  if(bluetoothState!=prevBluetoothState) {
    if(bluetoothState) {
      //digitalWrite(INDICATOR_LED_PIN, HIGH);
      Serial.println("connected");
    }
    else {
      //digitalWrite(INDICATOR_LED_PIN, LOW);    
      Serial.println("disconnected");      
    }
      
    prevBluetoothState = bluetoothState;
      //  Serial.println(bluetoothState);    
  }  
  
  // Allow BLE Shield to send/receive data
  ble_do_events();    
}


 
