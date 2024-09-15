import React, { useEffect, useState } from 'react';
import MapComponent from './MapComponent'; // Ensure this path is correct

const ResetButton = ({ setStatus }) => {
  const handleReset = () => {
    setStatus('Normal');  // Call setStatus to reset the status
  };

  return (
    <div className="flex flex-col w-1/2 mx-auto">
      <button
        onClick={handleReset}
        className="bg-blue-400 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded w-full">
        Resolved
      </button>
    </div>
  );
};

const SensorData = () => {
  const [accelX, setAccelX] = useState(null);
  const [accelY, setAccelY] = useState(null);
  const [accelZ, setAccelZ] = useState(null);
  const [accelMag, setAccelMag] = useState(null);
  const [gyroX, setGyroX] = useState(null);
  const [gyroY, setGyroY] = useState(null);
  const [gyroZ, setGyroZ] = useState(null);
  const [gyroMag, setGyroMag] = useState(null);
  const [status, setStatus] = useState('Standing');
  const [error, setError] = useState(null);
  const [lat, setLat] = useState('43.4727807');
  const [lng, setLng] = useState('-80.5393939');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://10.37.118.129/');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const textResponse = await response.text();
        console.log('Response:', textResponse);

        const accelXMatch = textResponse.match(/"Accel-X"\s*:\s*([0-9.\-]+)/);
        const accelYMatch = textResponse.match(/"Accel-Y"\s*:\s*([0-9.\-]+)/);
        const accelZMatch = textResponse.match(/"Accel-Z"\s*:\s*([0-9.\-]+)/);
    
        const gyroXMatch = textResponse.match(/"Gyro-X"\s*:\s*([0-9.\-]+)/);
        const gyroYMatch = textResponse.match(/"Gyro-Y"\s*:\s*([0-9.\-]+)/);
        const gyroZMatch = textResponse.match(/"Gyro-Z"\s*:\s*([0-9.\-]+)/);
    
        const latMatch = textResponse.match(/"Lat"\s*:\s*([0-9.\-]+)/);
        const lngMatch = textResponse.match(/"Lng"\s*:\s*([0-9.\-]+)/);

        const statusMatch = textResponse.match(/"Fall State"\s*:\s*([0-9.\-]+)/);

        setAccelX(accelXMatch ? parseFloat(accelXMatch[1]) : null);
        setAccelY(accelYMatch ? parseFloat(accelYMatch[1]) : null);
        setAccelZ(accelZMatch ? parseFloat(accelZMatch[1]) : null);

        setGyroX(gyroXMatch ? parseFloat(gyroXMatch[1]) : null);
        setGyroY(gyroYMatch ? parseFloat(gyroYMatch[1]) : null);
        setGyroZ(gyroZMatch ? parseFloat(gyroZMatch[1]) : null);

        setLat(latMatch ? parseFloat(latMatch[1]) : null);
        setLng(lngMatch ? parseFloat(lngMatch[1]) : null);

        if(statusMatch ? parseFloat(statusMatch[1]) : null == 0){
          setStatus("Standing");
        }
        else if(statusMatch ? parseFloat(statusMatch[1]) : null == 1){
          setStatus("Fallen");
        }

        setError(null);
      } catch (error) {
        setError('Failed to fetch data.');
      }
    };

    const calculateMagnitudes = () => {
      if (accelX !== null && accelY !== null && accelZ !== null) {
        setAccelMag(Math.sqrt(Math.pow(accelX, 2) + Math.pow(accelZ, 2)).toFixed(2));
      }
      if (gyroX !== null && gyroY !== null && gyroZ !== null) {
        setGyroMag(Math.sqrt(Math.pow(gyroX, 2) + Math.pow(gyroY, 2) + Math.pow(gyroZ, 2)).toFixed(2));
      }
    };

    const intervalId = setInterval(() => {
      fetchData();
      calculateMagnitudes();
    }, 75);

    return () => clearInterval(intervalId);
  }, [accelX, accelY, accelZ, gyroX, gyroY, gyroZ]);

  return (
    <div className="max-w-8xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <div className="flex flex-row gap-6">
        <div className="w-full border-4 border-gray-300 p-8 text-left overflow-auto">
          {error && !accelX && !accelY && !accelZ && !gyroX && !gyroY && !gyroZ && (
            <p className="text-red-500 text-xl mb-6">Error: {error}</p>
          )}
          {accelX !== null && accelY !== null && accelZ !== null && gyroX !== null && gyroY !== null && gyroZ !== null ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Accelerometer Data:</h2>
                <p className="text-xl text-gray-700 whitespace-nowrap">Accel-X: <span className="font-bold">{accelX}</span></p>
                <p className="text-xl text-gray-700 whitespace-nowrap">Accel-Y: <span className="font-bold">{accelY}</span></p>
                <p className="text-xl text-gray-700 whitespace-nowrap">Accel-Z: <span className="font-bold">{accelZ}</span></p>
                <p className="text-xl text-gray-700 whitespace-nowrap">Magnitude: <span className="font-bold">{accelMag}</span></p>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Gyroscope Data:</h2>
                <p className="text-xl text-gray-700 whitespace-nowrap">Gyro-X: <span className="font-bold">{gyroX}</span></p>
                <p className="text-xl text-gray-700 whitespace-nowrap">Gyro-Y: <span className="font-bold">{gyroY}</span></p>
                <p className="text-xl text-gray-700 whitespace-nowrap">Gyro-Z: <span className="font-bold">{gyroZ}</span></p>
                <p className="text-xl text-gray-700 whitespace-nowrap">Magnitude: <span className="font-bold">{gyroMag}</span></p>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Location Data:</h2>
                <p className="text-xl text-gray-700 whitespace-nowrap">Latitude: <span className="font-bold">{lat}</span></p>
                <p className="text-xl text-gray-700 whitespace-nowrap">Longitude: <span className="font-bold">{lng}</span></p>
              </div>
              <div className="flex justify-center items-center mb-8">
                <ResetButton setStatus={setStatus} />
              </div>
              <p className={`text-3xl font-semibold ${status === 'Fallen' ? 'text-red-600' : 'text-green-600'}`}>Status: {status}</p>
            </>
          ) : (
            <p className="text-gray-600 text-xl">Loading data...</p>
          )}
        </div>

        <div className="w-full border-4 border-gray-300 p-8">
          <MapComponent location={[lng, lat]} />
        </div>
      </div>
    </div>
  );
};

export default SensorData;
