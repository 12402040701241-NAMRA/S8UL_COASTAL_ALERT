import React from 'react';
import { AlertTriangle, Info, AlertCircle, Zap, X } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '../../lib/database.types';

type Alert = Database['public']['Tables']['alerts']['Row'];

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return {
          icon: Zap,
          bgColor: 'bg-red-900 dark:bg-red-800',
          textColor: 'text-white',
          iconColor: 'text-red-200',
          animate: 'animate-pulse',
        };
      case 'critical':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-900 dark:text-red-100',
          iconColor: 'text-red-600 dark:text-red-400',
          animate: '',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          textColor: 'text-amber-900 dark:text-amber-100',
          iconColor: 'text-amber-600 dark:text-amber-400',
          animate: '',
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-900 dark:text-blue-100',
          iconColor: 'text-blue-600 dark:text-blue-400',
          animate: '',
        };
    }
  };

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert) => {
        const config = getSeverityConfig(alert.severity);
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={`${config.bgColor} ${config.textColor} p-4 rounded-lg border ${config.animate}`}
          >
            <div className="flex items-start space-x-3">
              <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="mt-1 text-sm opacity-90">{alert.message}</p>
                    <p className="mt-2 text-xs opacity-75">
                      Issued: {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                      {alert.expires_at && (
                        <> • Expires: {format(new Date(alert.expires_at), 'MMM dd, HH:mm')}</>
                      )}
                    </p>
                  </div>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className={`${config.iconColor} hover:opacity-75 p-1 rounded`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};