// src/components/ConfigurationScreen.jsx
import React, { useState } from 'react';

export const ConfigurationScreen = ({ config, testConfig, defaultConfig, onSave, onCancel }) => {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = (e) => {
    e.preventDefault();
    onSave(localConfig);
  };

  const handleUrlChange = (e) => {
    setLocalConfig(prev => ({ ...prev, formUrl: e.target.value }));
  };

  const handleEntryChange = (fieldName, value) => {
    setLocalConfig(prev => ({
      ...prev,
      entries: {
        ...prev.entries,
        [fieldName]: value
      }
    }));
  };

  // Carga los valores de PRUEBA en el estado local del formulario
  const handleLoadTestValues = () => {
    setLocalConfig(testConfig);
  };

  // Carga los valores PREDETERMINADOS (reales) en el estado local
  const handleLoadDefaultValues = () => {
    setLocalConfig(defaultConfig);
  };

  return (
    <div className="config-screen">
      <h2>Configuración</h2>
      <form onSubmit={handleSave}>
        <div className="config-field">
          <label>URL del Formulario (`formResponse`)</label>
          <input
            type="text"
            value={localConfig.formUrl}
            onChange={handleUrlChange}
          />
        </div>
        <h3>Entry IDs de los Campos</h3>
        {Object.keys(localConfig.entries).map(key => (
          <div className="config-field" key={key}>
            <label>Entry ID para: {key.toUpperCase()}</label>
            <input
              type="text"
              value={localConfig.entries[key]}
              onChange={(e) => handleEntryChange(key, e.target.value)}
            />
          </div>
        ))}

        <div className="config-actions">
          <button type="submit">Guardar</button>
          <button type="button" onClick={onCancel}>Cancelar</button>
          <button
            type="button"
            className="test-button"
            onClick={handleLoadTestValues}
          >
            Cargar Valores de Prueba
          </button>
          {/* --- ¡NUEVO BOTÓN! --- */}
          <button
            type="button"
            className="default-button"
            onClick={handleLoadDefaultValues}
          >
            Cargar Valores Predeterminados
          </button>
        </div>
      </form>
    </div>
  );
}