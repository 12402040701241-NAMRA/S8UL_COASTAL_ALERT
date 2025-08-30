import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Alerts } from './pages/Alerts';
import { Analysis } from './pages/Analysis';
import { Response } from './pages/Response';
import { Auth } from './pages/Auth';
import { useAuthStore } from './stores/authStore';
import { useRealTimeData } from './hooks/useRealTimeData';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

function App() {
  const { user, loading, initialize } = useAuthStore();
  useRealTimeData();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/response" element={<Response />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;