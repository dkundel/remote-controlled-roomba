/*
 Roomba Controller for receiving SMS-based commands
 Based on the SMS receiver sketch by Javier Zorzano / TD for the MKR GSM 1400 board
*/

// include the GSM library
#include <MKRGSM.h>

#include "arduino_secrets.h" 
// Usually we enter your sensitive data in the Secret tab or arduino_secrets.h but in this case the file is blank
const char PINNUMBER[] = SECRET_PINNUMBER; // if you are having a problem, can eliminate the include and replace SECRET_PINNUMBER with an empty string

// initialize the library instances
GSM gsmAccess;
GSM_SMS sms;

// Array to hold the number a SMS is retreived from
char senderNumber[20];

int baudPin=6;

bool vacuumState=0;

void setup() {
  // initialize serial communications and wait for port to open:
  Serial.begin(9600);
  Serial1.begin(19200);

  pinMode(baudPin,OUTPUT);
  digitalWrite(baudPin,HIGH);

  Serial.println("SMS Messages Receiver");

  // connection state
  bool connected = false;

  // Start GSM connection
  while (!connected) {
    if (gsmAccess.begin(PINNUMBER) == GSM_READY) {
      connected = true;
    } else {
      Serial.println("Not connected");
      delay(1000);
    }
  }

  Serial.println("GSM initialized");
  Serial.println("Waiting for messages");

  Serial.println("setting up roomba");
  wake();
  // start roomba
  delay(200);
  lightTest();
  Serial.println("Roomba ready");
}

void loop() {
  int c;

  // check serial:
  char comm = Serial.read();
  Serial.println(comm);
  commandTranslator(comm);

  // check for SMS
  if (sms.available()) {
    Serial.println("Message received from:");

    // Get remote number
    sms.remoteNumber(senderNumber, 20);
    Serial.println(senderNumber);

    // An example of message disposal
    // Any messages starting with # should be discarded
    if (sms.peek() == '#') {
      Serial.println("Discarded SMS");
      sms.flush();
    }

    // Read message bytes and print them
    // 16 chars allowed.
    char m[16];
    int p=0;
    while ((c = sms.read()) != -1) {
      m[p]=(char)c;
      p++;
//      Serial.println((char)c);
    }
    
    Serial.println();
    Serial.println(m);
    Serial.println("\nEND OF MESSAGE");

    // Delete message from modem memory
    sms.flush();
    Serial.println("MESSAGE DELETED");

    // translate comms
   for (int x=0;x<16;x++) {
    commandTranslator(m[x]);
    delay(300); 
   }
  }
}

void commandTranslator(char comm) {
  if (comm=='f') {
    forward();
  }
  else if (comm=='b') {
    backward();
  }
  else if (comm=='l') {
    turnCW();
  }
  else if (comm=='r') {
    turnCCW();
  }
  else if (comm=='v') {
    toggleVacuum();
  }
  else if (comm=='s') {
    spot();
  }
  else if (comm=='o') {
    vacuumOff();
  }
  else if (comm=='d') {
    dock();
  }
  else if (comm=='w') {
    wake();
  }
  else {
    // stop
    drive(0,0);
  }
}

void lightTest() { // turns light on for 2 seconds then off for 2 seconds
  Serial1.write(139);
  Serial1.write((byte)3);
  Serial1.write((byte)1);
  Serial1.write((byte)255);
  delay(200);
  Serial1.write(139);
  Serial1.write((byte)3);
  Serial1.write((byte)0);
  Serial1.write((byte)0);
  delay(200);
}

void drive(int16_t velocity, int16_t radius)
{
  Serial1.write(137);
  Serial1.write((velocity & 0xff00) >> 8);
  Serial1.write(velocity & 0xff);
  Serial1.write((radius & 0xff00) >> 8);
  Serial1.write(radius & 0xff);
}

void forward() {
  drive(50,0);
}

void backward() {
  drive(-50,0);
}

void turnCW() {
  drive(50,10);
}

void turnCCW() {
  drive(50,-10);
}

void vacuumOn() {
  Serial1.write(138);
  Serial1.write(111);
  vacuumState=1;
}

void vacuumOff() {
  Serial1.write(138);
  Serial1.write((byte)000);
  vacuumState=0;
}

void toggleVacuum() {
  if (vacuumState) {
    vacuumOff();
  }
  else {
    vacuumOn();
  }
}

void spot() {
  Serial1.write(134);
  delay(50);
  Serial1.write(131);
}

void dock() {
  Serial1.write(143);
}

void wake() {
  digitalWrite(baudPin,HIGH);
  delay(3000);
  digitalWrite(baudPin,LOW);
  delay(200);
  digitalWrite(baudPin,HIGH);
  delay(200);
  digitalWrite(baudPin,LOW);
  delay(200);
  digitalWrite(baudPin,HIGH);
  delay(200);
  digitalWrite(baudPin,LOW);
  delay(200);
  digitalWrite(baudPin,HIGH);
  delay(200);  
  Serial1.write(128);
  delay(200);
  Serial1.write(131);
}

void saveSong(uint8_t songNumber, const uint8_t* data, int len)
{
    Serial1.write(140);
    Serial1.write(songNumber);
    Serial1.write(len >> 1); // 2 bytes per note
    Serial1.write(data, len);
}

void playSong(uint8_t songNumber)
{
  Serial1.write(141);
  Serial1.write(songNumber); 
}
