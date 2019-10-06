#include <WebUSB.h>

//https://davrami.github.io/angularWebUsb/poten

const WebUSBURL URLS [] = {
{1, "webusb-ar.glitch.me/"},
{0, "localhost: 8000"},
};

const uint8_t ALLOWED_ORIGINS [] = {1, 2};

WebUSB WebUSBSerial (URLS, 2, 1, ALLOWED_ORIGINS, 2);

#define Serial WebUSBSerial

/**
 * Instance of the analog pins that we are going to use.
 */
const int analogPin = A0;
int value; // variable that stores the raw analog reading
int position; // position of the potentiometer as a percentage
float voltage; // voltage received by the potentiometer

void setup () {
    while (! Serial) {
        ;
    }
    Serial.begin (9600);
    Serial.write ("Sketch begins.>");
    Serial.flush ();
}

void loop () {
    /**
     * The loop will be constantly pending that receives data.
     */
    if (Serial && Serial.available ()) {

        value = analogRead (analogPin); // perform the raw analog reading
        position = map (value, 0, 1023, 0, 100); // convert to percentage

        voltage = value * (5.0 / 1023.0); // conversion in voltage
    
        int byte = Serial.read();
        
        if (byte == 'P') {
        // when receiving a P send the position of the potentiometer
          Serial.write ("Pos"); // send Por + (value)
          Serial.write (position);
        } else if (byte == 'V') {
        // when receiving a V send the voltages that receive the potentiometer
          Serial.write ("Vol"); // send Vol + (value)
          Serial.write (voltage);
        }
        Serial.flush ();
    }
}