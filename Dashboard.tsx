import React, { useEffect } from 'react';
import { MonitoringMap } from '../components/Dashboard/MonitoringMap';
import { AlertBanner } from '../components/Dashboard/AlertBanner';
import { QuickStats } from '../components/Dashboard/QuickStats';
import { StationStatusGrid } from '../components/Dashboard/StationStatusGrid';
import { useDashboardStore } from '../stores/dashboardStore';

export const Dashboard: React.FC = () => {
  const { alerts, subscribeToRealTimeUpdates, fetchActiveAlerts } = useDashboardStore();

  useEffect(() => {
    fetchActiveAlerts();
    subscribeToRealTimeUpdates();
  }, [fetchActiveAlerts, subscribeToRealTimeUpdates]);

  return (
    <div className="space-y-6">
      {/* Active Alerts Banner */}
      <AlertBanner alerts={alerts} />

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map - Takes up 2 columns on xl screens */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Real-time Monitoring Map
            </h2>
            <MonitoringMap />
          </div>
        </div>

        {/* Station Status Grid - Takes up 1 column on xl screens */}
        <div className="xl:col-span-1">
          <StationStatusGrid />
        </div>
      </div>
    </div>
  );
};