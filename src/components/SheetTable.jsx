// src/components/SheetTable.jsx
import React, { useState, useEffect } from 'react';
import { loadData, saveData } from '../services/api';

export function SheetTable({ config, isDebugMode, onShowConfig }) {

  // -- ESTADO Y CONFIGURACIÓN DEL COMPONENTE --
  const flowSinDecoOptions = [
    'Se activa en Línea',
    'No se activa - Problema de herramientas',
    'No se activa - Cte no acepta activarlo en el caso',
    'N/A',
  ];

  const today = new Date();
  const newRowTemplate = {
    id: Date.now(),
    year: today.getFullYear(),
    month: String(today.getMonth() + 1).padStart(2, '0'),
    day: String(today.getDate()).padStart(2, '0'),
    servicio: 'HOGAR',
    lider: 'AYLEN GONZALEZ',
    representante: 'MARTINEZ PEINADO SAMUEL SALVADOR',
    producto: '', // Empezar vacío
    dni: '', // Empezar vacío
    gestion: '', // Empezar vacío
    caso_yoizen: '', // Empezar vacío
    flow_sin_deco: flowSinDecoOptions[0],
    unificacion: 'No Corresponde (no tiene serv. Para unificar)',
    provincia: 'OTRA',
    promo_tactica: 'NO',
  };

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHiddenColumns, setShowHiddenColumns] = useState(false);

  // --- CARGA DE DATOS INICIAL ---
  useEffect(() => {
    const fetchData = async () => {
      setStatus('⏳ Cargando datos guardados...');
      setIsLoading(true);
      try {
        const savedRows = await loadData();

        if (savedRows && savedRows.length > 0) {
          setRows(savedRows);
          setStatus('✅ Datos cargados correctamente.');
        } else {
          setRows([newRowTemplate]);
          setStatus('No hay datos guardados. Mostrando fila nueva.');
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setStatus('❌ Error al cargar datos. Usando fila por defecto.');
        setRows([newRowTemplate]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // El array vacío asegura que se ejecute solo al montar

  // --- MANEJO DE LA TABLA ---
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

  // --- LÓGICA DE ENVÍO AL FORMULARIO (FRONTEND) ---
  const submitRowToGoogle = (formData) => {
    // --- DIAGNÓSTICO ---
    console.log('[submitRowToGoogle] isDebugMode:', isDebugMode); // <-- AÑADIDO
    // ---------------------
    return new Promise((resolve, reject) => {
      let iframe;
      let form;
      try {
        const iframeName = 'hidden_iframe';
        iframe = document.createElement('iframe');
        iframe.name = iframeName;

        // --- LÓGICA DE DEPURACIÓN ---
        if (isDebugMode) { // <-- Usar la prop
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
          if (form && form.parentNode) document.body.removeChild(form);
          // Solo quitar el iframe si NO estamos depurando
          if (!isDebugMode && iframe && iframe.parentNode) { // <-- Usar la prop
            document.body.removeChild(iframe);
          }
          resolve();
        }, isDebugMode ? 3000 : 800); // <-- Usar la prop

      } catch (error) {
        // Si hay un error, limpiar también
        try {
          if (form && form.parentNode) document.body.removeChild(form);
          if (iframe && iframe.parentNode) document.body.removeChild(iframe);
        } catch (e) {
            console.error("Error cleaning up form/iframe:", e)
         }
        reject(error);
      }
    });
  };

  // --- LÓGICA DE SUBMIT (ENVÍO + GUARDADO) ---
  const handleSubmitAll = async (e) => {
    e.preventDefault();

    // --- DIAGNÓSTICO ---
    console.log('[handleSubmitAll] isDebugMode:', isDebugMode); // <-- AÑADIDO
    // ---------------------

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
      if (isDebugMode) { // <-- Usar la prop
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

    // GUARDAR DATOS EN EL BACKEND (Google Sheet)
    try {
      setStatus(`⏳ Guardando ${rows.length} filas...`);
      await saveData(rows);
      setStatus(`✅ Envío completado. ${submittedCount} filas enviadas y ${rows.length} guardadas.`);
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      setStatus(`❌ Envío al formulario OK, pero falló al guardar. Revisa la consola.`);
    }

    setIsSubmitting(false);
  };

  // --- RENDERIZADO ---
  if (isLoading) {
    return (
      <div>
        <button className="config-button" disabled>⚙️</button>
        <h2>Cargador de Datos a Google Form</h2>
        <p>⏳ Cargando datos...</p>
      </div>
    );
  }

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
          <button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Enviando...' : `Enviar y Guardar ${rows.length} Filas`}
          </button>
        </div>
      </form>
      <p id="status">{status}</p>
    </div>
  );
}