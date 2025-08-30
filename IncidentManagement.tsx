import React, { useState, useEffect } from 'react';
import { Plus, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';

const incidentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['info', 'warning', 'critical', 'emergency']),
  assigned_teams: z.string(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

export const IncidentManagement: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
  });

  useEffect(() => {
    fetchIncidents();
    fetchTasks();
  }, []);

  const fetchIncidents = async () => {
    const { data } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setIncidents(data);
  };

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('incident_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setTasks(data);
  };

  const onSubmit = async (data: IncidentFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const incidentData = {
        ...data,
        assigned_teams: data.assigned_teams.split(',').map(team => team.trim()),
        created_by: user.id,
      };

      await supabase
        .from('incidents')
        .insert(incidentData);

      reset();
      setShowCreateForm(false);
      fetchIncidents();
    } catch (error) {
      console.error('Error creating incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId: string, status: string) => {
    await supabase
      .from('incidents')
      .update({ 
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        resolved_by: status === 'resolved' ? user?.id : null,
      })
      .eq('id', incidentId);
    
    fetchIncidents();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-900 text-white';
      case 'critical': return 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-100';
      case 'warning': return 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100';
      case 'info': return 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'investigating': return <Clock className="h-5 w-5 text-amber-600" />;
      case 'active': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const isAuthorizedToManage = profile?.role === 'admin' || profile?.role === 'operator';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency Response</h2>
        {isAuthorizedToManage && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Incident</span>
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New Incident
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Incident Title
              </label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Brief incident description"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Detailed incident description and current situation"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  {...register('severity')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Teams (comma-separated)
                </label>
                <input
                  {...register('assigned_teams')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Emergency Response Team A, Coast Guard Unit 1"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>{loading ? 'Creating...' : 'Create Incident'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Incidents List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Incidents</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(incident.status)}
                    <h4 className="font-semibold text-gray-900 dark:text-white">{incident.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      incident.status === 'resolved' 
                        ? 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'
                        : incident.status === 'active'
                        ? 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-100'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{incident.description}</p>
                  
                  {incident.assigned_teams.length > 0 && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Teams: {incident.assigned_teams.join(', ')}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {format(new Date(incident.created_at), 'MMM dd, yyyy HH:mm')}
                    {incident.resolved_at && (
                      <> • Resolved: {format(new Date(incident.resolved_at), 'MMM dd, HH:mm')}</>
                    )}
                  </div>
                </div>

                {isAuthorizedToManage && incident.status !== 'resolved' && (
                  <div className="flex flex-col space-y-2 ml-4">
                    {incident.status === 'active' && (
                      <button
                        onClick={() => updateIncidentStatus(incident.id, 'investigating')}
                        className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-md text-sm hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                      >
                        Mark Investigating
                      </button>
                    )}
                    <button
                      onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>

              {/* Show related tasks */}
              {selectedIncident === incident.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Related Tasks</h5>
                  <div className="space-y-2">
                    {tasks
                      .filter(task => task.incident_id === incident.id)
                      .map(task => (
                        <div key={task.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Assigned to: {task.assigned_to}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'completed' 
                                ? 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'
                                : task.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100'
                                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedIncident(selectedIncident === incident.id ? null : incident.id)}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {selectedIncident === incident.id ? 'Hide Tasks' : 'Show Tasks'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New Incident
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Incident Title
              </label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Brief incident description"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Detailed incident description and current situation"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  {...register('severity')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Teams
                </label>
                <input
                  {...register('assigned_teams')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Team A, Team B, Coast Guard Unit 1"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>{loading ? 'Creating...' : 'Create Incident'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};