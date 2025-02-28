// Define the pins for the IR sensors
#define IR_SENSOR_A_PIN 2
#define IR_SENSOR_B_PIN 8

unsigned long startTime = 0;
unsigned long stopTime = 0;
bool timerRunning = false;


const float distance = 0.4;

void setup() {
  // Start serial communication at 9600 baud rate
  Serial.begin(9600);
  
  // Configure the IR sensor pins as inputs
  pinMode(IR_SENSOR_A_PIN, INPUT);
  pinMode(IR_SENSOR_B_PIN, INPUT);
}

void loop() {
  // Read the state of the IR sensors
  int sensorAValue = digitalRead(IR_SENSOR_A_PIN);
  int sensorBValue = digitalRead(IR_SENSOR_B_PIN);
  
  // If Sensor A is activated and the timer is not running, start the timer
  if (sensorAValue == HIGH && timerRunning == false) {
    startTime = millis(); // Record the current time
    timerRunning = true;
    
  }
  
  // If Sensor B is activated and the timer is running, stop the timer
  if (sensorBValue == HIGH && timerRunning == true) {
    stopTime = millis(); // Record the current time
    timerRunning = false;
    // Calculate the elapsed time in seconds
    float elapsedTime = (stopTime - startTime); // Convert ms to seconds
    
    // Calculate the speed in meters per milisecond
    float speed_mpms = distance / elapsedTime;
    
    // Convert speed to kilometers per hour
    float speed_kmph = speed_mpms * 3600;
    
    // Send a message to Python if speed exceeds 4 km/h
     
      if(speed_kmph > 4 && elapsedTime > 0){
        Serial.print(speed_kmph);
      }
 // Send speed with 2 decimal places
 delay(1000);
}

}

  
  
  
