import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- 1. HOOK PARA LEER/ESCRIBIR EN LOCALSTORAGE ---
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


// --- 2. CONFIGURACIÓN DE PRUEBA ---
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

// --- 3. CONFIGURACIÓN POR DEFECTO (REAL) ---
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


// --- 4. COMPONENTE PRINCIPAL (ENRUTADOR) ---
function App() {
  const [config, setConfig] = useLocalStorage('fillerAppConfig', DEFAULT_CONFIG);
  // --- ¡NUEVO ESTADO DE DEPURACIÓN! ---
  const [isDebugMode, setIsDebugMode] = useLocalStorage('fillerAppDebugMode', false);
  
  const [showConfig, setShowConfig] = useState(false);

  if (showConfig) {
    return <ConfigurationScreen
      config={config} 
      testConfig={TEST_CONFIG} 
      defaultConfig={DEFAULT_CONFIG} 
      // Pasamos el estado de depuración y su setter
      isDebugMode={isDebugMode}
      setIsDebugMode={setIsDebugMode}
      onSave={(newConfig) => {
        setConfig(newConfig);
        setShowConfig(false);
      }}
      onCancel={() => setShowConfig(false)}
    />;
  }

  return <SheetTable
    config={config}
    isDebugMode={isDebugMode} // Pasamos el estado de depuración a la tabla
    onShowConfig={() => setShowConfig(true)}
  />;
}


// --- 5. COMPONENTE: PANTALLA DE CONFIGURACIÓN (MODIFICADO) ---
function ConfigurationScreen({ 
  config, 
  testConfig, 
  defaultConfig, 
  isDebugMode, // Recibimos el estado
  setIsDebugMode, // Recibimos el setter
  onSave, 
  onCancel 
}) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = (e) => {
    e.preventDefault();
    onSave(localConfig);
    // El modo de depuración se guarda instantáneamente, no necesita
    // formar parte del botón "Guardar" de la config.
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
  
  const handleLoadTestValues = () => {
    setLocalConfig(testConfig);
  };

  const handleLoadDefaultValues = () => {
    setLocalConfig(defaultConfig);
  };
  
  // --- ¡NUEVO HANDLER! ---
  // Este SÍ guarda directamente en localStorage
  const handleDebugToggle = (e) => {
    setIsDebugMode(e.target.checked);
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
        
        {/* --- ¡NUEVO CAMPO DE DEPURACIÓN! --- */}
        <div className="config-toggle">
          <label>
            <input 
              type="checkbox"
              checked={isDebugMode}
              onChange={handleDebugToggle}
            />
            Activar Modo Depuración (iframe visible y logs)
          </label>
        </div>
        
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


// --- 6. COMPONENTE DE TABLA (CON LÓGICA DE DEPURACIÓN) ---
function SheetTable({ config, isDebugMode, onShowConfig }) {
  
  const flowSinDecoOptions = [
    'Se activa en Línea',
    'No se activa - Problema de herramientas',
    'No se activa - Cte no acepta activarlo en el caso',
    'N/A',
  ];

  // --- PLANTILLA DE FILA ---
  const today = new Date();
  const newRowTemplate = {
    id: Date.now(),
    year: today.getFullYear(),
    month: String(today.getMonth() + 1).padStart(2, '0'),
    day: String(today.getDate()).padStart(2, '0'),
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

  const [rows, setRows] = useState([newRowTemplate]);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHiddenColumns, setShowHiddenColumns] = useState(false);

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
  
  const isValidDate = (y, m, d) => {
    if (!y || !m || !d) return false;
    const date = new Date(y, m - 1, d);
    return (
      date.getFullYear() === parseInt(y) &&
      date.getMonth() === m - 1 &&
      date.getDate() === parseInt(d)
    );
  };

  // --- LÓGICA DE ENVÍO (MODIFICADA CON isDebugMode) ---
  const submitRowToGoogle = (formData) => {
    return new Promise((resolve, reject) => {
      let iframe; // Definir iframe aquí para que esté en scope
      let form; // Definir form aquí
      try {
        const iframeName = 'hidden_iframe';
        iframe = document.createElement('iframe');
        iframe.name = iframeName;
        
        // --- LÓGICA DE DEPURACIÓN ---
        if (isDebugMode) {
          iframe.style.width = '100%';
          iframe.style.height = '300px';
          iframe.style.border = '2px solid red';
          iframe.style.margin = '20px 0';
        } else {
          iframe.style.display = 'none'; // Oculto
        }
        // --- FIN LÓGICA DE DEPURACIÓN ---

        document.body.appendChild(iframe);

        form = document.createElement('form');
        form.action = config.formUrl;
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

        // Limpiar después de enviar
        setTimeout(() => {
          document.body.removeChild(form);
          // Solo quitar el iframe si NO estamos depurando
          if (!isDebugMode) {
            document.body.removeChild(iframe);
          }
          resolve();
        }, isDebugMode ? 3000 : 800); // 3s para depurar, 0.8s en producción

      } catch (error) {
        // Si hay un error, limpiar también
        try {
          if (form) document.body.removeChild(form);
          if (iframe) document.body.removeChild(iframe);
        } catch (e) {
          // Ignorar si ya se borraron
        }
        reject(error);
      }
    });
  };

  // --- LÓGICA DE SUBMIT (MODIFICADA CON isDebugMode) ---
  const handleSubmitAll = async (e) => {
    e.preventDefault();
    
    // Limpiar iframes de depuración viejos
    const oldIframes = document.getElementsByName('hidden_iframe');
    oldIframes.forEach(iframe => iframe.parentNode.removeChild(iframe));

    setIsSubmitting(true);
    setStatus('⏳ Iniciando envío...');

    let submittedCount = 0;
    let failedRows = [];

    const { entries } = config; 

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      if (!isValidDate(row.year, row.month, row.day) || !row.producto) {
        failedRows.push(i + 1);
        continue;
      }
      setStatus(`⏳ Enviando fila ${i + 1} de ${rows.length}...`);
      
      const rowFormData = new FormData();
      
      // Lógica de Fecha (Formato YYYY-MM-DD)
      const finalDateString = `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`;
      rowFormData.append(entries.fecha, finalDateString);
      
      // Anexar el resto de los datos
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
      
      // --- LÓGICA DE DEPURACIÓN ---
      if (isDebugMode) {
        console.log(`--- DATOS FILA ${i + 1} A ENVIAR ---`);
        for (const [key, value] of rowFormData.entries()) {
          console.log(`${key}: ${value}`);
        }
        console.log(`Enviando a: ${config.formUrl}`);
      }
      // --- FIN LÓGICA DE DEPURACIÓN ---
      
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

  // --- JSX de la Tabla (con 3 campos de fecha) ---
  return (
    <div>
      <button onClick={onShowConfig} className="config-button">
        ⚙️
      </button>

      <h2>Cargador de Datos a Google Form</h2>
      <form onSubmit={handleSubmitAll}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="sheet-table">
            <thead>
              <tr>
                <th>Año</th>
                <th>Mes</th>
                <th>Día</th>
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
            
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="number"
                      value={row.year}
                      onChange={(e) => handleInputChange(index, 'year', e.target.value)}
                      placeholder="Año"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.month}
                      onChange={(e) => handleInputChange(index, 'month', e.target.value)}
                      placeholder="Mes"
                      min="1" max="12"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.day}
                      onChange={(e) => handleInputChange(index, 'day', e.target.value)}
                      placeholder="Día"
                      min="1" max="31"
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
                      placeholder="Ingresa un producto válido"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.dni}
                      onChange={(e) => handleInputChange(index, 'dni', e.target.value)}
                      placeholder="DNI del cliente"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.gestion}
                      onChange={(e) => handleInputChange(index, 'gestion', e.target.value)}
                      placeholder="N° de Gestión"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.caso_yoizen}
                      onChange={(e) => handleInputChange(index, 'caso_yoizen', e.target.value)}
                      placeholder="N° de Caso"
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


// --- 7. RENDER ---
const root = createRoot(document.getElementById('root'));
root.render(<App />);