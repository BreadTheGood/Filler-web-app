// src/main.jsx
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ConfigurationScreen } from './components/ConfigurationScreen';
import { SheetTable } from './components/SheetTable';

// --- CONFIGURACIÓN DE PRUEBA ---
const TEST_CONFIG = {
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfMOZTUzWMdfyeYhSeE5F4AuoQV6hs8luslEzCGnfFyCh6jcA/formResponse',
  entries: {
    fecha: 'entry.101913523',
    servicio: 'entry.1544604602',
    lider: 'entry.48171834',
    representante: 'entry.614923459',
    producto: 'entry.267393900',
    dni: 'entry.1223153849',
    gestion: 'entry.2044585376',
    caso_yoizen: 'entry.1258293142',
    flow_sin_deco: 'entry.1541832960',
    unificacion: 'entry.423471570',
    provincia: 'entry.49049516',
    promo_tactica: 'entry.862315059',
  }
};

// --- CONFIGURACIÓN POR DEFECTO (REAL) ---
const DEFAULT_CONFIG = {
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeytdXFZj8LWi72s4rQU4OE_QqTNV3sNmRkJyJjZU3YBFd3xQ/formResponse',
  entries: {
    fecha: 'entry.1781500597',
    servicio: 'entry.2103711837',
    lider: 'entry.1640447617',
    representante: 'entry.297979220',
    producto: 'entry.1078004677',
    dni: 'entry.2091996480',
    gestion: 'entry.1531477507',
    caso_yoizen: 'entry.624182876',
    flow_sin_deco: 'entry.1368250571',
    unificacion: 'entry.538026869',
    provincia: 'entry.2040870261',
    promo_tactica: 'entry.85694086',
  }
};


// --- COMPONENTE PRINCIPAL (ENRUTADOR) ---
function App() {
  const [config, setConfig] = useLocalStorage('fillerAppConfig', DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  
  // Nuevo: Estado para el modo Depuración
  const [isDebugMode, setIsDebugMode] = useState(false);

  if (showConfig) {
    return <ConfigurationScreen
      config={config}
      testConfig={TEST_CONFIG}
      defaultConfig={DEFAULT_CONFIG}
      onSave={(newConfig) => {
        setConfig(newConfig);
        setShowConfig(false);
      }}
      onCancel={() => setShowConfig(false)}
    />;
  }

  return (
    <>
      <SheetTable
        config={config}
        isDebugMode={isDebugMode}
        onShowConfig={() => setShowConfig(true)}
      />
      {/* Botón para activar/desactivar el modo de depuración */}
      <button 
        onClick={() => setIsDebugMode(!isDebugMode)} 
        title="Alternar Modo Depuración"
        className="debug-button"
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 100,
          opacity: 0.7
        }}
      >
        🐛{isDebugMode ? 'ON' : 'OFF'} {/* Mostrar estado */}
      </button>
    </>
  );
}

// --- RENDER ---
const root = createRoot(document.getElementById('root'));
root.render(<App />);