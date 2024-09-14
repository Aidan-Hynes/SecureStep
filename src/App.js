// src/SensorData.js
import React, { useEffect, useState } from 'react';

const SensorData = () => {
  const [sensorValue, setSensorValue] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the actual IP address of your ESP8266
        const response = await fetch('http://10.37.118.91');

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const textResponse = await response.text(); // Get response as plain text
        console.log('Response:', textResponse);

        // Extract the integer value from the string "Sensor Value: X"
        const valueString = textResponse.split(':')[1].trim(); // Get the part after the colon and trim spaces
        const sensorValueInt = parseInt(valueString, 10); // Parse it to an integer

        setSensorValue(sensorValueInt);

        // Update status based on sensor value
        if (sensorValueInt > 10) {
          setStatus('Fallen');
        } else {
          setStatus('Normal');
        }

        // Clear any previous error if the fetch is successful
        setError(null);
      } catch (error) {
        // Set error only if no valid data has been fetched
        if (sensorValue === null) {
          setError('Failed to fetch data.');
        }
      }
    };

    // Fetch data every second
    const intervalId = setInterval(fetchData, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [sensorValue]);

  return (
    <div>
      <h1>ESP8266 Sensor Data</h1>
      {error && sensorValue === null && <p>Error: {error}</p>}
      {sensorValue !== null ? (
        <>
          <p>Sensor Value: {sensorValue}</p>
          <p>Status: {status}</p> {/* Display the status */}
        </>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default SensorData;
