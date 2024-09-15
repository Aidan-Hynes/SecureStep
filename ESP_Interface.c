#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>  // For SSL/TLS
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

#define PIN_RED    14 
#define PIN_GREEN  13
#define PIN_BLUE   12

Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp;
String lat, lng;

const unsigned int loc_poll = 20;
const unsigned int info_poll = 5;
unsigned int last_time_loc = 0;
unsigned int last_time_info = 0;
bool fall_state = false;

const char* ssid = "HackTheNorth";
const char* password = "PASSWORD";

const char* apiKey = "AIzaSyAi2tTIYkHWwyQASN2nBa_6plmzPO1RkxA";
const char* geolocationUrl = "https://www.googleapis.com/geolocation/v1/geolocate?key=API_KEY";

//define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

// Create a web server on port 80
ESP8266WebServer server(80);

//define get time function
unsigned long getTime() {
  timeClient.update();
  unsigned long curr_time = timeClient.getEpochTime();
  return curr_time;
}


//Set LED Light Functions
void RedLED() {
  digitalWrite(PIN_RED,   HIGH);
  digitalWrite(PIN_GREEN, LOW);
  digitalWrite(PIN_BLUE,  LOW);
}

void GreenLED() {
  digitalWrite(PIN_RED,   LOW);
  digitalWrite(PIN_GREEN, HIGH);
  digitalWrite(PIN_BLUE,  LOW);
}

void BlueLED() {
  digitalWrite(PIN_RED,   LOW);
  digitalWrite(PIN_GREEN, LOW);
  digitalWrite(PIN_BLUE,  HIGH);
}

void OffLED() {
  digitalWrite(PIN_RED,   LOW);
  digitalWrite(PIN_GREEN, LOW);
  digitalWrite(PIN_BLUE,  LOW);
}

//define wifi connect function
void connectWifi(){
  WiFi.begin(ssid, password);

  //Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("Connecting to WiFi...");

    BlueLED();
    delay(500);
    OffLED();
    delay(500);
  }

  Serial.println("Connected to WiFi"); 
  BlueLED();
  
  // Start the web server
  server.begin();
  server.on("/", handleRoot);
  String IP_Address = WiFi.localIP().toString();

  Serial.println("Web server started");
  Serial.print("ESP8266 IP Address: ");
  Serial.println(IP_Address);

  delay(1000);
}

//This function will handle incoming HTTP requests
void handleRoot() {
  //Send JSON data
  last_time_info = getTime(); 
  String jsonAccel = "{\"Accel-X\" : " + String(a.acceleration.x) + "," + "\"Accel-Y\" : " + String(a.acceleration.y) + "," + "\"Accel-Z\" : " + String(a.acceleration.z) + "}";
  String jsonGyro = "{\"Gyro-X\" : " + String(g.gyro.x) + "," + "\"Gyro-Y\" : " + String(g.gyro.y) + "," + "\"Gyro-Z\" : " + String(g.gyro.z) + "}"; 
  String jsonLoc = "{\"Lat\" : " + String(lat) + "," + "\"Lng\" : " + String(lng) + "}";
  String jsonFall = "{\"Fall State\" : " + String(fall_state) + "}";
  String jsonResponse = jsonAccel + "," + jsonGyro + "," + jsonLoc + "," + jsonFall;
  Serial.println(jsonResponse);
  
  server.sendHeader("Access-Control-Allow-Origin", "*"); // Allow CORS
  server.send(200, "application/json", jsonResponse);
}


void getLocation() {
  //Scan for geolocation points
  Serial.println("Scanning for Wi-Fi networks...");
  int n = WiFi.scanNetworks();  // Perform network scan

  String jsonWifiPoints;
  if (n == 0) {
    Serial.println("No networks found");
  } 
  else {
    Serial.print(n);
    Serial.println(" networks found"); 
    jsonWifiPoints = "{\"wifiAccessPoints\":[";
    for (int i = 0; i < n; ++i) {
      jsonWifiPoints += "{\"macAddress\":\"" + WiFi.BSSIDstr(i) + "\",";
      jsonWifiPoints += "\"signalStrength\":" + String(WiFi.RSSI(i)) + "}";
      if (i < n - 1) jsonWifiPoints += ",";
    }
    jsonWifiPoints += "]}";
  }
  Serial.println("JSON WiFi Payload: " + jsonWifiPoints);
  WiFi.scanDelete();

  //make SSL insecure lol
  BearSSL::WiFiClientSecure client;
  client.setInsecure();
  HTTPClient https;
  https.begin(client, geolocationUrl);
  https.addHeader("Content-Type", "application/json");
  
  //Send payload;
  int httpCode = https.POST(jsonWifiPoints);
  
  //Check the return value
  if (httpCode > 0) {
    //get the response
    String payload = https.getString();
    Serial.println("Response:");
    Serial.println(payload);
    lat = payload.substring(payload.indexOf("lat")+6, payload.indexOf(","));
    lng = payload.substring(payload.indexOf("lng")+6, payload.indexOf("}")-3);
  }
  else {
    Serial.print("Error on HTTP request: ");
    Serial.println(httpCode);
  }
  
  https.end(); //Close connection
}


void setup() {
  pinMode(PIN_RED,   OUTPUT);
  pinMode(PIN_GREEN, OUTPUT);
  pinMode(PIN_BLUE,  OUTPUT);  

  Serial.begin(115200);

  while (!Serial) delay(10);

  Serial.println("Adafruit MPU6050 test!");

  // Try to initialize!
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");

  //init accel and gyro
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  
  //set filter
  mpu.setFilterBandwidth(MPU6050_BAND_5_HZ);

  Serial.println("");
  delay(100);

  connectWifi();
}


void loop() {
  unsigned int curr_time = getTime();
  // if (curr_time - last_time_loc >= loc_poll) {
  //   getLocation();
  //   last_time_loc = curr_time;
  // }

  // if (curr_time - last_time_info >= info_poll) {
  //   RedLED();
  // }
  // else if (curr_time - last_time_info >= info_poll*3) {
  //   connectWifi();
  // }

  //get new sensor events with the readings
  mpu.getEvent(&a, &g, &temp);

  server.handleClient();
  
  double norm = sqrt((a.acceleration.x*a.acceleration.x)+(a.acceleration.z*a.acceleration.z));

  if(norm > 8 && !fall_state) {
    RedLED();
    fall_state = true;
    getLocation();
  }
  else if(norm < 8){
    GreenLED();
    fall_state = false;
  }

  delay(25);
}
