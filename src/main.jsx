import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

// --- CONFIGURACIÓN ---
// URL del formulario de tu *empresa* (terminado en formResponse)
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf5_ZjtTrdPwn7RTLvQdmyaEjqkuuC26ApDcN9j-MA-4W51Jg/formResponse';
// IDs de todos tus campos
const ID_FECHA = 'entry.322884199';
const ID_SERVICIO = 'entry.1138872800';
const ID_LIDER = 'entry.1049550588';
const ID_REPRESENTANTE = 'entry.118987505';
const ID_PRODUCTO = 'entry.1101921189';
const ID_DNI = 'entry.975512048';
const ID_GESTION = 'entry.982208339';
const ID_CASO_YOIZEN = 'entry.655622226';
const ID_FLOW_SIN_DECO = 'entry.1786619160';
const ID_UNIFICACION = 'entry.1796590257';
const ID_PROVINCIA = 'entry.262024519';
const ID_PROMO_TACTICA = 'entry.2143876304';
// --- FIN DE CONFIGURACIÓN ---

// --- Opciones para Dropdowns ---
const flowSinDecoOptions = [
  'Se activa en Línea',
  'No se activa - Problema de herramientas',
  'No se activa - Cte no acepta activarlo en el caso',
  'N/A',
];

// --- Plantilla para Fila Nueva ---
// Helper para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0'); // Meses son 0-based
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const newRowTemplate = {
  id: Date.now(),
  fecha: getTodayString(), // Campo de fecha único con valor de hoy
  servicio: 'HOGAR', // Fijo
  lider: 'AYLEN GONZALEZ', // Fijo
  representante: 'MARTINEZ PEINADO SAMUEL SALVADOR', // Editable
  producto: '',
  dni: '',
  gestion: '',
  caso_yoizen: '',
  flow_sin_deco: flowSinDecoOptions[0], // Dropdown, default a la primera opción
  unificacion: 'No Corresponde (no tiene serv. Para unificar)', // Editable
  provincia: 'OTRA', // Fijo
  promo_tactica: 'NO', // Fijo
};

function App() {
  const [rows, setRows] = useState([newRowTemplate]);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Funciones de la Tabla ---

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

  // --- Lógica de Envío ---

  const submitRowToGoogle = (formData) => {
    return new Promise((resolve, reject) => {
      try {
        const iframeName = 'hidden_iframe';
        const iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const form = document.createElement('form');
        form.action = FORM_URL;
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

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // 1. Validar (solo revisamos que la fecha no esté vacía)
      if (!row.fecha) {
        failedRows.push(i + 1);
        continue;
      }
      
      setStatus(`⏳ Enviando fila ${i + 1} de ${rows.length}...`);

      // 2. Preparar el FormData
      const rowFormData = new FormData();
      
      rowFormData.append(ID_FECHA, row.fecha); // Envía la fecha formateada
      rowFormData.append(ID_SERVICIO, row.servicio);
      rowFormData.append(ID_LIDER, row.lider);
      rowFormData.append(ID_REPRESENTANTE, row.representante);
      rowFormData.append(ID_PRODUCTO, row.producto);
      rowFormData.append(ID_DNI, row.dni);
      rowFormData.append(ID_GESTION, row.gestion);
      rowFormData.append(ID_CASO_YOIZEN, row.caso_yoizen);
      rowFormData.append(ID_FLOW_SIN_DECO, row.flow_sin_deco);
      rowFormData.append(ID_UNIFICACION, row.unificacion);
      rowFormData.append(ID_PROVINCIA, row.provincia);
      rowFormData.append(ID_PROMO_TACTICA, row.promo_tactica);
      
      // 3. Enviar y esperar
      try {
        await submitRowToGoogle(rowFormData);
        submittedCount++;
      } catch (error) {
        console.error(`Error en fila ${i + 1}:`, error);
        failedRows.push(i + 1);
      }
    }

    // 4. Reporte final
    let finalMessage = `✅ Envío completado. ${submittedCount} filas enviadas.`;
    if (failedRows.length > 0) {
      finalMessage += ` ❌ Error en filas (datos inválidos): ${failedRows.join(', ')}.`;
    }
    
    setStatus(finalMessage);
    setIsSubmitting(false);
  };

  return (
    <div>
      <h2>FillerV2</h2>
      <form onSubmit={handleSubmitAll}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="sheet-table">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>SERVICIO</th>
                <th>LIDER</th>
                <th>REPRESENTANTE (A-Z)</th>
                <th>PRODUCTO</th>
                <th>NUMERO DE DNI</th>
                <th>NUMERO DE GESTION</th>
                <th>NUMERO DE CASO YOIZEN</th>
                <th>FLOW SIN DECO</th>
                <th>UNIFICACION DE FACTURA</th>
                <th>Provincia y localidad</th>
                <th>¿NUEVAS promos tácticas?</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  {/* --- CAMBIOS DE ESTA VERSIÓN --- */}
                  
                  {/* 1. Input de Fecha Único */}
                  <td>
                    <input
                      type="date"
                      value={row.fecha}
                      onChange={(e) => handleInputChange(index, 'fecha', e.target.value)}
                      required
                    />
                  </td>
                  
                  {/* 2. Campo Fijo */}
                  <td>
                    <input
                      type="text"
                      value={row.servicio}
                      disabled
                      style={{ backgroundColor: '#eee' }} // Estilo visual para campo fijo
                    />
                  </td>
                  
                  {/* 3. Campo Fijo */}
                  <td>
                    <input
                      type="text"
                      value={row.lider}
                      disabled
                      style={{ backgroundColor: '#eee' }}
                    />
                  </td>
                  
                  {/* 4. Campo Pre-llenado (Editable) */}
                  <td>
                    <input
                      type="text"
                      value={row.representante}
                      onChange={(e) => handleInputChange(index, 'representante', e.target.value)}
                      required
                    />
                  </td>
                  
                  {/* --- Campos sin cambios --- */}
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
                  
                  {/* --- CAMBIOS DE ESTA VERSIÓN --- */}

                  {/* 5. Dropdown (Select) */}
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
                  
                  {/* 6. Campo Pre-llenado (Editable) */}
                  <td>
                    <input
                      type="text"
                      value={row.unificacion}
                      onChange={(e) => handleInputChange(index, 'unificacion', e.target.value)}
                      required
                    />
                  </td>
                  
                  {/* 7. Campo Fijo */}
                  <td>
                    <input
                      type="text"
                      value={row.provincia}
                      disabled
                      style={{ backgroundColor: '#eee' }}
                    />
                  </td>
                  
                  {/* 8. Campo Fijo */}
                  <td>
                    <input
                      type="text"
                      value={row.promo_tactica}
                      disabled
                      style={{ backgroundColor: '#eee' }}
                    />
                  </td>
                  
                  {/* --- Botón sin cambios --- */}
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
          <button type="button" onClick={addRow}>
            + Añadir Fila
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : `Enviar ${rows.length} Filas`}
          </button>
        </div>
      </form>
      <p id="status">{status}</p>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);