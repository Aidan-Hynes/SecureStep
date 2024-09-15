import React from 'react';
import SensorData from './components/SensorData';
import MapComponent from './components/MapComponent';  // Import the map component

const App = () => {
  return (
    <div className="min-h-screen bg-blue-200 bg-pattern flex flex-col items-center justify-center space-y-6">
      <SensorData />
    </div>
  );
};

export default App;
