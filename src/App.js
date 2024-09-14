// src/SensorData.js
import React, { useEffect, useState } from 'react';

const SensorData = () => {
  const [accelX, setAccelX] = useState(null);
  const [accelY, setAccelY] = useState(null);
  const [accelZ, setAccelZ] = useState(null);
  const [gyroX, setGyroX] = useState(null);
  const [gyroY, setGyroY] = useState(null);
  const [gyroZ, setGyroZ] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the actual IP address of your ESP8266
        const response = await fetch('http://10.37.118.129/');

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const textResponse = await response.text(); // Get response as plain text
        console.log('Response:', textResponse);

        // Split the response into separate JSON objects
        const dataParts = textResponse.split('},{'); 
        const accelData = JSON.parse(dataParts[0] + '}'); // Parse first part (accelerometer)
        const gyroData = JSON.parse('{' + dataParts[1]);  // Parse second part (gyroscope)

        // Set individual accelerometer values
        setAccelX(accelData["Accel-X"]);
        setAccelY(accelData["Accel-Y"]);
        setAccelZ(accelData["Accel-Z"]);

        // Set individual gyroscope values
        setGyroX(gyroData["Gyro-X"]);
        setGyroY(gyroData["Gyro-Y"]);
        setGyroZ(gyroData["Gyro-Z"]);

        // Update status based on a condition (e.g., checking if combined values exceed thresholds)
        if (Math.abs(accelData["Accel-X"]) > 10 || Math.abs(accelData["Accel-Y"]) > 10 || Math.abs(accelData["Accel-Z"]) > 10 ||
            Math.abs(gyroData["Gyro-X"]) > 10 || Math.abs(gyroData["Gyro-Y"]) > 10 || Math.abs(gyroData["Gyro-Z"]) > 10) {
          setStatus('Fallen');
        } else {
          setStatus('Normal');
        }

        // Clear any previous error if the fetch is successful
        setError(null);
      } catch (error) {
        // Set error only if no valid data has been fetched
        if (accelX === null && accelY === null && accelZ === null && gyroX === null && gyroY === null && gyroZ === null) {
          setError('Failed to fetch data.');
        }
      }
    };

    // Fetch data every second
    const intervalId = setInterval(fetchData, 20);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [accelX, accelY, accelZ, gyroX, gyroY, gyroZ]);

  return (
    <div>
      <h1>ESP8266 Sensor Data</h1>
      {error && accelX === null && accelY === null && accelZ === null && gyroX === null && gyroY === null && gyroZ === null && <p>Error: {error}</p>}
      {accelX !== null && accelY !== null && accelZ !== null && gyroX !== null && gyroY !== null && gyroZ !== null ? (
        <>
          <h2>Accelerometer Data:</h2>
          <p>Accel-X: {accelX}</p>
          <p>Accel-Y: {accelY}</p>
          <p>Accel-Z: {accelZ}</p>

          <h2>Gyroscope Data:</h2>
          <p>Gyro-X: {gyroX}</p>
          <p>Gyro-Y: {gyroY}</p>
          <p>Gyro-Z: {gyroZ}</p>

          <p>Status: {status}</p> {/* Display the status */}
        </>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default SensorData;
