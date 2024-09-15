#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>  // For SSL/TLS
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

#define PIN_RED    14 
#define PIN_GREEN  13
#define PIN_BLUE   12

Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp;
String lat, lng;

const char* ssid = "HackTheNorth";
const char* password = "HTNX2024";

const char* apiKey = "AIzaSyAi2tTIYkHWwyQASN2nBa_6plmzPO1RkxA";
const char* geolocationUrl = "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAi2tTIYkHWwyQASN2nBa_6plmzPO1RkxA";

// Create a web server on port 80
ESP8266WebServer server(80);


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


//This function will handle incoming HTTP requests
void handleRoot() {
  //Send JSON data
  GreenLED();  
  String jsonAccel = "{\"Accel-X\" : " + String(a.acceleration.x) + "," + "\"Accel-Y\" : " + String(a.acceleration.y) + "," + "\"Accel-Z\" : " + String(a.acceleration.z) + "}";
  String jsonGyro = "{\"Gyro-X\" : " + String(g.gyro.x) + "," + "\"Gyro-Y\" : " + String(g.gyro.y) + "," + "\"Gyro-Z\" : " + String(g.gyro.z) + "}"; 
  String jsonLoc = "{\"Lat\" : " + String(lat) + "," + "\"Lat\" : " + String(lng) + "}";
  String jsonResponse = jsonAccel + "," + jsonGyro + "," + jsonLoc;
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
    lng = payload.substring(payload.indexOf("lng")+6, payload.indexOf("}"));
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

  //Wifi connection
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
}


void loop() {
 //Get new sensor events with the readings
  mpu.getEvent(&a, &g, &temp);

  delay(10);
  server.handleClient();
}