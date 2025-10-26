// src/components/Header.jsx
import React from 'react';

// ... (styles remain the same) ...
const headerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  backgroundColor: '#f8f9fa', // Un color de fondo claro
  padding: '10px 20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  zIndex: 1000, // Asegura que esté por encima de otros elementos
  display: 'flex',
  justifyContent: 'space-around', // Distribuye el espacio entre métricas
  alignItems: 'center',
  borderBottom: '1px solid #dee2e6'
};
const metricStyle = { textAlign: 'center' };
const metricValueStyle = { fontSize: '1.4em', fontWeight: 'bold', color: '#007bff' };
const metricLabelStyle = { fontSize: '0.8em', color: '#6c757d', marginTop: '2px' };


export const Header = ({ metrics }) => {
  // Provide default values for all metrics in case metrics is null initially
  const data = metrics || { sphTotal: 0, sphInternet: 0, ventasMes: 0, ventasHoy: 0, sphHoy: 0, internetHoy: 0 };

  return (
    <header style={headerStyle}>
      {/* --- Existing Metrics --- */}
      <div style={metricStyle}>
        <div style={metricValueStyle}>{data.ventasHoy}</div>
        <div style={metricLabelStyle}>Ventas Hoy</div>
      </div>
      <div style={metricStyle}>
        <div style={metricValueStyle}>{data.ventasMes}</div>
        <div style={metricLabelStyle}>Ventas Mes</div>
      </div>
      <div style={metricStyle}>
        <div style={metricValueStyle}>{data.sphTotal}</div>
        <div style={metricLabelStyle}>SPH Mes</div> {/* Clarified label */}
      </div>
      <div style={metricStyle}>
        <div style={metricValueStyle}>{data.sphInternet}</div>
        <div style={metricLabelStyle}>SPH Int. Mes</div> {/* Clarified label */}
      </div>

      {/* --- ¡NUEVAS MÉTRICAS! --- */}
      <div style={metricStyle}>
        <div style={metricValueStyle}>{data.sphHoy}</div>
        <div style={metricLabelStyle}>SPH Hoy</div>
      </div>
      <div style={metricStyle}>
        <div style={metricValueStyle}>{data.internetHoy}</div>
        <div style={metricLabelStyle}>Internet Hoy</div>
      </div>
      {/* --- FIN NUEVAS MÉTRICAS --- */}
    </header>
  );
};