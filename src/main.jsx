import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- 1. HOOK PARA LEER/ESCRIBIR EN LOCALSTORAGE ---
// (Esto guarda tu configuración en el navegador)
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}


// --- 2. CONFIGURACIÓN INICIAL ---
// (Usa esta si no hay nada guardado en el navegador)
const DEFAULT_CONFIG = {
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSf5_ZjtTrdPwn7RTLvQdmyaEjqkuuC26ApDcN9j-MA-4W51Jg/formResponse',
  entries: {
    fecha: 'entry.322884199',
    servicio: 'entry.1138872800',
    lider: 'entry.1049550588',
    representante: 'entry.118987505',
    producto: 'entry.1101921189',
    dni: 'entry.975512048',
    gestion: 'entry.982208339',
    caso_yoizen: 'entry.655622226',
    flow_sin_deco: 'entry.1786619160',
    unificacion: 'entry.1796590257',
    provincia: 'entry.262024519',
    promo_tactica: 'entry.2143876304',
  }
};


// --- 3. COMPONENTE PRINCIPAL (ENRUTADOR) ---
function App() {
  // Carga la config desde localStorage o usa la default
  const [config, setConfig] = useLocalStorage('fillerAppConfig', DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);

  if (showConfig) {
    // Si showConfig es true, muestra la pantalla de configuración
    return <ConfigurationScreen
      config={config}
      onSave={(newConfig) => {
        setConfig(newConfig); // Guarda la nueva config
        setShowConfig(false); // Vuelve a la tabla
      }}
      onCancel={() => setShowConfig(false)} // Vuelve a la tabla
    />;
  }

  // Por defecto, muestra la tabla de datos
  return <SheetTable
    config={config} // Pasa la config actual a la tabla
    onShowConfig={() => setShowConfig(true)} // Pasa la función para mostrar la config
  />;
}


// --- 4. NUEVO COMPONENTE: PANTALLA DE CONFIGURACIÓN ---
function ConfigurationScreen({ config, onSave, onCancel }) {
  // Copia local de la config para editarla
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = (e) => {
    e.preventDefault();
    onSave(localConfig);
  };

  // Handler para cambiar la Form URL
  const handleUrlChange = (e) => {
    setLocalConfig(prev => ({ ...prev, formUrl: e.target.value }));
  };

  // Handler para cambiar los Entry IDs (que están anidados)
  const handleEntryChange = (fieldName, value) => {
    setLocalConfig(prev => ({
      ...prev,
      entries: {
        ...prev.entries,
        [fieldName]: value
      }
    }));
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
        {/* Genera un input por cada entry en la config */}
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
        </div>
      </form>
    </div>
  );
}


// --- 5. COMPONENTE DE TABLA (TU CÓDIGO ANTERIOR, ADAPTADO) ---
// Recibe 'config' y 'onShowConfig' como props
function SheetTable({ config, onShowConfig }) {
  // (Todo el estado y lógica de la tabla se queda aquí)
  
  // Opciones para Dropdowns (sin cambios)
  const flowSinDecoOptions = [
    'Se activa en Línea',
    'No se activa - Problema de herramientas',
    'No se activa - Cte no acepta activarlo en el caso',
    'N/A',
  ];

  // Plantilla para Fila Nueva (sin cambios)
  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const newRowTemplate = {
    id: Date.now(),
    fecha: getTodayString(),
    servicio: 'HOGAR',
    lider: 'AYLEN GONZALEZ',
    representante: 'MARTINEZ PEINADO SAMUEL SALVADOR',
    producto: '',
    dni: '',
    gestion: '',
    caso_yoizen: '',
    flow_sin_deco: flowSinDecoOptions[0],
    unificacion: 'No Corresponde (no tiene serv. Para unificar)',
    provincia: 'OTRA',
    promo_tactica: 'NO',
  };

  // Estado de la tabla (sin cambios)
  const [rows, setRows] = useState([newRowTemplate]);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHiddenColumns, setShowHiddenColumns] = useState(false);

  // Funciones de la Tabla (sin cambios)
  const handleInputChange = (index, fieldName, value) => {
    const newRows = rows.map((row, i) => {
      if (i === index) {
        return { ...row, [fieldName]: value };
      }
      return row;
    });
    setRows(newRows);
  };
  const addRow = () => {
    setRows([...rows, { ...newRowTemplate, id: Date.now() }]);
  };
  const removeRow = (index) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  // --- LÓGICA DE ENVÍO (MODIFICADA) ---
  // Ahora lee 'config.formUrl' y 'config.entries'
  
  const submitRowToGoogle = (formData) => {
    return new Promise((resolve, reject) => {
      try {
        const iframeName = 'hidden_iframe';
        const iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const form = document.createElement('form');
        form.action = config.formUrl; // <-- USA LA CONFIG
        form.method = 'POST';
        form.target = iframeName;
        form.style.display = 'none';

        for (const [key, value] of formData.entries()) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();

        setTimeout(() => {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
          resolve();
        }, 800);

      } catch (error) {
        reject(error);
      }
    });
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('⏳ Iniciando envío...');

    let submittedCount = 0;
    let failedRows = [];

    // Lee los Entry IDs desde el objeto 'config'
    const { entries } = config; 

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.fecha) {
        failedRows.push(i + 1);
        continue;
      }
      setStatus(`⏳ Enviando fila ${i + 1} de ${rows.length}...`);
      
      const rowFormData = new FormData();
      
      // Añade campos usando los IDs de la config
      rowFormData.append(entries.fecha, row.fecha);
      rowFormData.append(entries.servicio, row.servicio);
      rowFormData.append(entries.lider, row.lider);
      rowFormData.append(entries.representante, row.representante);
      rowFormData.append(entries.producto, row.producto);
      rowFormData.append(entries.dni, row.dni);
      rowFormData.append(entries.gestion, row.gestion);
      rowFormData.append(entries.caso_yoizen, row.caso_yoizen);
      rowFormData.append(entries.flow_sin_deco, row.flow_sin_deco);
      rowFormData.append(entries.unificacion, row.unificacion);
      rowFormData.append(entries.provincia, row.provincia);
      rowFormData.append(entries.promo_tactica, row.promo_tactica);
      
      try {
        await submitRowToGoogle(rowFormData);
        submittedCount++;
      } catch (error) {
        console.error(`Error en fila ${i + 1}:`, error);
        failedRows.push(i + 1);
      }
    }

    let finalMessage = `✅ Envío completado. ${submittedCount} filas enviadas.`;
    if (failedRows.length > 0) {
      finalMessage += ` ❌ Error en filas (datos inválidos): ${failedRows.join(', ')}.`;
    }
    setStatus(finalMessage);
    setIsSubmitting(false);
  };

  // --- JSX de la Tabla (MODIFICADO) ---
  return (
    <div>
      {/* Botón de Configuración añadido en la esquina */}
      <button onClick={onShowConfig} className="config-button">
        ⚙️
      </button>

      <h2>Filler V2</h2>
      <form onSubmit={handleSubmitAll}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="sheet-table">
            {/* ... Tu <thead> (sin cambios) ... */}
            <thead>
              <tr>
                <th>FECHA</th>
                {showHiddenColumns && (
                  <>
                    <th>SERVICIO</th>
                    <th>LIDER</th>
                  </>
                )}
                <th>REPRESENTANTE (A-Z)</th>
                <th>PRODUCTO</th>
                <th>NUMERO DE DNI</th>
                <th>NUMERO DE GESTION</th>
                <th>NUMERO DE CASO YOIZEN</th>
                <th>FLOW SIN DECO</th>
                {showHiddenColumns && (
                  <>
                    <th>UNIFICACION DE FACTURA</th>
                    <th>Provincia y localidad</th>
                    <th>¿NUEVAS promos tácticas?</th>
                  </>
                )}
                <th>Acción</th>
              </tr>
            </thead>
            
            {/* ... Tu <tbody> (sin cambios) ... */}
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="date"
                      value={row.fecha}
                      onChange={(e) => handleInputChange(index, 'fecha', e.target.value)}
                      required
                    />
                  </td>
                  {showHiddenColumns && (
                    <>
                      <td>
                        <input type="text" value={row.servicio} disabled />
                      </td>
                      <td>
                        <input type="text" value={row.lider} disabled />
                      </td>
                    </>
                  )}
                  <td>
                    <input
                      type="text"
                      value={row.representante}
                      onChange={(e) => handleInputChange(index, 'representante', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.producto}
                      onChange={(e) => handleInputChange(index, 'producto', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.dni}
                      onChange={(e) => handleInputChange(index, 'dni', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.gestion}
                      onChange={(e) => handleInputChange(index, 'gestion', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.caso_yoizen}
                      onChange={(e) => handleInputChange(index, 'caso_yoizen', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <select
                      value={row.flow_sin_deco}
                      onChange={(e) => handleInputChange(index, 'flow_sin_deco', e.target.value)}
                    >
                      {flowSinDecoOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </td>
                  {showHiddenColumns && (
                    <>
                      <td>
                        <input
                          type="text"
                          value={row.unificacion}
                          onChange={(e) => handleInputChange(index, 'unificacion', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input type="text" value={row.provincia} disabled />
                      </td>
                      <td>
                        <input type="text" value={row.promo_tactica} disabled />
                      </td>
                    </>
                  )}
                  <td>
                    <button type="button" onClick={() => removeRow(index)} disabled={rows.length <= 1}>
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* ... Tus table-actions (sin cambios) ... */}
        <div className="table-actions">
          <div>
            <button 
              type="button" 
              onClick={addRow} 
              style={{ marginRight: '10px' }}
            >
              + Añadir Fila
            </button>
            <button 
              type="button" 
              onClick={() => setShowHiddenColumns(!showHiddenColumns)}
            >
              {showHiddenColumns ? 'Ocultar Opciones' : 'Mostrar Opciones'}
            </button>
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : `Enviar ${rows.length} Filas`}
          </button>
        </div>
      </form>
      <p id="status">{status}</p>
    </div>
  );
}


// --- 6. RENDER (Sin cambios) ---
const root = createRoot(document.getElementById('root'));
root.render(<App />);