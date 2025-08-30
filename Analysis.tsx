import React from 'react';
import { DataVisualization } from '../components/Analytics/DataVisualization';

export const Analysis: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analyze historical sensor data and identify trends across monitoring stations.
        </p>
      </div>
      
      <DataVisualization />
    </div>
  );
};