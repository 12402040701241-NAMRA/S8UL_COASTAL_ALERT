import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, Download, TrendingUp, Waves } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface ChartDataPoint {
  timestamp: string;
  tide_level: number;
  wave_height: number;
  wind_speed: number;
  water_temperature: number;
  atmospheric_pressure: number;
}

export const DataVisualization: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [stations, setStations] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState(7);
  const [activeChart, setActiveChart] = useState<'tides' | 'waves' | 'weather' | 'environmental'>('tides');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      fetchChartData();
    }
  }, [selectedStation, dateRange]);

  const fetchStations = async () => {
    const { data } = await supabase
      .from('monitoring_stations')
      .select('*')
      .order('name');
    
    if (data) {
      setStations(data);
      if (data.length > 0) {
        setSelectedStation(data[0].id);
      }
    }
  };

  const fetchChartData = async () => {
    if (!selectedStation) return;

    setLoading(true);
    try {
      const startDate = startOfDay(subDays(new Date(), dateRange));
      const endDate = endOfDay(new Date());

      const { data } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('station_id', selectedStation)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp');

      if (data) {
        const processedData = data.map(reading => ({
          timestamp: format(new Date(reading.timestamp), 'MMM dd HH:mm'),
          tide_level: reading.tide_level,
          wave_height: reading.wave_height,
          wind_speed: reading.wind_speed,
          water_temperature: reading.water_temperature,
          atmospheric_pressure: reading.atmospheric_pressure,
        }));

        setChartData(processedData);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Timestamp', 'Tide Level (m)', 'Wave Height (m)', 'Wind Speed (m/s)', 'Water Temperature (°C)', 'Atmospheric Pressure (hPa)'],
      ...chartData.map(point => [
        point.timestamp,
        point.tide_level,
        point.wave_height,
        point.wind_speed,
        point.water_temperature,
        point.atmospheric_pressure,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor_data_${selectedStation}_${dateRange}days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartTypes = [
    { key: 'tides', label: 'Tides & Water Level', icon: Waves },
    { key: 'waves', label: 'Wave Conditions', icon: TrendingUp },
    { key: 'weather', label: 'Weather Data', icon: Calendar },
    { key: 'environmental', label: 'Environmental', icon: TrendingUp },
  ];

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeChart) {
      case 'tides':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px' 
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="tide_level" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name="Tide Level (m)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'waves':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px' 
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="wave_height" 
                stroke="#06b6d4" 
                strokeWidth={2}
                name="Wave Height (m)" 
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'weather':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="wind" orientation="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="pressure" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px' 
                }}
              />
              <Legend />
              <Line 
                yAxisId="wind"
                type="monotone" 
                dataKey="wind_speed" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Wind Speed (m/s)" 
              />
              <Line 
                yAxisId="pressure"
                type="monotone" 
                dataKey="atmospheric_pressure" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Pressure (hPa)" 
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'environmental':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px' 
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="water_temperature" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Water Temperature (°C)" 
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
          Historical Data Analysis
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Station</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>

          <button
            onClick={exportData}
            disabled={chartData.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Chart type selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {chartTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.key}
              onClick={() => setActiveChart(type.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeChart === type.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {renderChart()}
      </div>
    </div>
  );
};