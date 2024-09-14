// src/SensorData.js
import React, { useEffect, useState } from 'react';

const SensorData = () => {
  const [sensorValue, setSensorValue] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the actual IP address of your ESP8266
        const response = await fetch('http://172.20.10.5');
        const textResponse = await response.text(); // Get response as text
        console.log('Response:', textResponse); // Log the response
        const data = JSON.parse(textResponse); // Attempt to parse JSON
        setSensorValue(data.sensorValue);
      } catch (error) {
        setError(error.message);
      }
    };

    // Fetch data every second
    const intervalId = setInterval(fetchData, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h1>ESP8266 Sensor Data</h1>
      {error && <p>Error: {error}</p>}
      {sensorValue !== null ? (
        <p>Sensor Value: {sensorValue}</p>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default SensorData;
