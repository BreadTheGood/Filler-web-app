// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
// --- ¡NUEVO! Importar API de métricas ---
import { getUserInfo, getUserMetrics } from './services/api';
import { ConfigurationScreen } from './components/ConfigurationScreen';
import { SheetTable } from './components/SheetTable';
// --- ¡NUEVO! Importar Header ---
import { Header } from './components/Header';
import { TEST_CONFIG, DEFAULT_CONFIG } from './config';

export function App() {
  // ... state for config, showConfig, user, error ...
  const [config, setConfig] = useLocalStorage('fillerAppConfig', DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // --- ¡NUEVO! Estado inicial incluye los nuevos campos ---
  const [metrics, setMetrics] = useState(null);
  const initialMetricsState = { sphTotal: 0, sphInternet: 0, ventasMes: 0, ventasHoy: 0, sphHoy: 0, internetHoy: 0 };
  // --- FIN NUEVO ---

  // --- Login and Metrics Effect ---
  useEffect(() => {
    getUserInfo()
      .then(userInfo => {
        if (userInfo && userInfo.email) {
          setUser(userInfo);
          getUserMetrics(userInfo.email)
            .then(metricData => {
              if (metricData && !metricData.error) {
                // Merge received data with defaults to ensure all fields exist
                setMetrics({ ...initialMetricsState, ...metricData });
              } else {
                 console.error("Error al calcular métricas:", metricData?.error);
                 setMetrics(initialMetricsState); // Use default zeros on error
              }
            })
            .catch(metricErr => {
              console.error("Error fetching metrics:", metricErr);
              setMetrics(initialMetricsState); // Use default zeros on network error
            });
        } else {
          setError('No se pudo verificar tu identidad...');
        }
      })
      .catch(err => {
        console.error("Error al obtener info del usuario:", err);
        setError(err.message || 'Error al conectar con el servidor...');
      });
  }, []);

  // --- Conditional Rendering ---
  if (error) {
    return <div className="error-screen"><h2>Error de Carga</h2><p>{error}</p></div>;
  }
  if (!user || metrics === null) { // Check if metrics is still null
    return <div className="loading-screen"><h2>Cargando datos...</h2></div>;
  }

  // --- Main Render ---
  return (
    <div style={{ paddingTop: '70px' }}> {/* Adjust padding if header height changes */}
      <Header metrics={metrics} />
      {showConfig ? (
        <ConfigurationScreen /* ... props ... */
            config={config}
            testConfig={TEST_CONFIG}
            defaultConfig={DEFAULT_CONFIG}
            onSave={(newConfig) => {
                setConfig(newConfig);
                setShowConfig(false);
            }}
            onCancel={() => setShowConfig(false)}
        />
      ) : (
        <SheetTable /* ... props ... */
            config={config}
            user={user}
            onShowConfig={() => setShowConfig(true)}
        />
      )}
    </div>
  );
}