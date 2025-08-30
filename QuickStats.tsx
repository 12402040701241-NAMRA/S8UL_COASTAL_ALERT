import React from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';

export const QuickStats: React.FC = () => {
  const { stations, alerts } = useDashboardStore();

  const stationStats = stations.reduce(
    (acc, station) => {
      acc[station.status] = (acc[station.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const alertStats = alerts.reduce(
    (acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const stats = [
    {
      title: 'Active Stations',
      value: stationStats.normal + stationStats.warning + stationStats.critical || 0,
      total: stations.length,
      icon: Activity,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Normal Status',
      value: stationStats.normal || 0,
      total: stations.length,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Warning/Critical',
      value: (stationStats.warning || 0) + (stationStats.critical || 0),
      total: stations.length,
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      title: 'Offline Stations',
      value: stationStats.offline || 0,
      total: stations.length,
      icon: XCircle,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  {stat.total > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      / {stat.total}
                    </p>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};