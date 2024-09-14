#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp;

const char* ssid = "HackTheNorth";
const char* password = "FAKE PASSWORD";



// Create a web server on port 80
ESP8266WebServer server(80);

// This function will handle incoming HTTP requests
void handleRoot() {
  // Send JSON data with CORS headers
  String jsonAccel = "{\"Accel-X\" : " + String(a.acceleration.x) + "," + "\"Accel-Y\" : " + String(a.acceleration.y) + "," + "\"Accel-Z\" : " + String(a.acceleration.z) + "}";
  String jsonGyro = "{\"Gyro-X\" : " + String(g.gyro.x) + "," + "\"Gyro-Y\" : " + String(g.gyro.y) + "," + "\"Gyro-Z\" : " + String(g.gyro.z) + "}"; 

  String jsonResponse = jsonAccel + "," + jsonGyro;
  Serial.println(jsonResponse);
  
  server.sendHeader("Access-Control-Allow-Origin", "*"); // Allow CORS
  server.send(200, "application/json", jsonResponse);
}

void setup() {
  Serial.begin(115200);

  while (!Serial)
    delay(10); // will pause Zero, Leonardo, etc until serial console opens

  Serial.println("Adafruit MPU6050 test!");

  // Try to initialize!
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");

  //init accel
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  Serial.print("Accelerometer range set to: ");
  switch (mpu.getAccelerometerRange()) {
    case MPU6050_RANGE_2_G:
      Serial.println("+-2G");
      break;
    case MPU6050_RANGE_4_G:
      Serial.println("+-4G");
      break;
    case MPU6050_RANGE_8_G:
      Serial.println("+-8G");
      break;
    case MPU6050_RANGE_16_G:
      Serial.println("+-16G");
      break;
  }
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  Serial.print("Gyro range set to: ");
  switch (mpu.getGyroRange()) {
    case MPU6050_RANGE_250_DEG:
      Serial.println("+- 250 deg/s");
      break;
    case MPU6050_RANGE_500_DEG:
      Serial.println("+- 500 deg/s");
      break;
    case MPU6050_RANGE_1000_DEG:
      Serial.println("+- 1000 deg/s");
      break;
    case MPU6050_RANGE_2000_DEG:
      Serial.println("+- 2000 deg/s");
      break;
  }
  //other stuff
  
  mpu.setFilterBandwidth(MPU6050_BAND_5_HZ);
  Serial.print("Filter bandwidth set to: ");
  switch (mpu.getFilterBandwidth()) {
    case MPU6050_BAND_260_HZ:
      Serial.println("260 Hz");
      break;
    case MPU6050_BAND_184_HZ:
      Serial.println("184 Hz");
      break;
    case MPU6050_BAND_94_HZ:
      Serial.println("94 Hz");
      break;
    case MPU6050_BAND_44_HZ:
      Serial.println("44 Hz");
      break;
    case MPU6050_BAND_21_HZ:
      Serial.println("21 Hz");
      break;
    case MPU6050_BAND_10_HZ:
      Serial.println("10 Hz");
      break;
    case MPU6050_BAND_5_HZ:
      Serial.println("5 Hz");
      break;
  }
  Serial.println("");
  delay(100);

  //Wi-fi connection
  WiFi.begin(ssid, password);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Start the web serve
  server.begin();
  server.on("/", handleRoot);
  String IP_Address = WiFi.localIP().toString();

  Serial.println("Web server started");
  Serial.print("ESP8266 IP Address: ");
  Serial.println(IP_Address);

  // String jsonIP = "{\"IP Address\" : " + IP_Address + "}";
  
  // HTTPClient http;
  // WiFiClient wifiClient;

  // http.begin(wifiClient, "http://10.37.101.189:3000/");
  // http.addHeader("Content-Type", "application/json");
  // http.POST(jsonIP);
  // http.end();
}

void loop() {
 //Get new sensor events with the readings
  mpu.getEvent(&a, &g, &temp);

  delay(10);

  server.handleClient();

  Serial.println("Scanning for Wi-Fi networks...");
  int n = WiFi.scanNetworks();  // Perform network scan
  
  if (n == 0) {
    Serial.println("No networks found");
  } 
  else {
    Serial.print(n);
    Serial.println(" networks found");

    for (int i = 0; i < n; ++i) {
      // Print each network's SSID, RSSI, and BSSID (MAC address)
      Serial.print("Network: ");
      Serial.print(WiFi.SSID(i));
      Serial.print(" (MAC: ");
      Serial.print(WiFi.BSSIDstr(i));
      Serial.print("), Signal Strength (RSSI): ");
      Serial.print(WiFi.RSSI(i));
      Serial.println(" dBm");
    }
  }    
}
