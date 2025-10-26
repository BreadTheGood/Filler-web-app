// src/components/SheetTable.jsx
import React, { useState, useEffect, useRef } from 'react';
import { loadData, saveData } from '../services/api'; // Make sure this path is correct

// --- Options Lists for Dropdowns ---
const representanteOptions = [
  'ARIAS YOHANA YAMILA', 'ESPINOZA BARRERA JENNIFER ROMINA', 'HEREDIA AZUL AYLEN',
  'MAIDANA MELINA MADELEIN', 'CALIVA FEDERICO JAVIER', 'ABBA CASTELLO JOSEFINA',
  'ROJAS MICAELA ALEJANDRA', 'YOSSEN AGUSTINA', 'PABON FERMIN YESLANI DIOSLISETH',
  'SALGAN ROMINA ALEJANDRA', 'ROLDAN LUDMILA ANAHI', 'OJEDA PALAT BRAIAN RAFAEL CARLOS',
  'SERRANO TOMAS IGNACIO', 'GOMEZ LEYLA CAROLINA', 'MANSILLA NOELIA BELEN',
  'TARANTINO MAYRA VANESA', 'LEDESMA PEDRO ANDRES JESUS', 'NAVARRO YANINA DE LOS MILAGROS',
  'ASTRADA NADIA SABRINA', 'SALDAÑO VIRGINIA ANABEL', 'MARTINEZ PEINADO SAMUEL SALVADOR'
];
const productoOptions = [
  '', // Add an empty option to force selection
  'PORTA', 'ALTA DE LINEA (MOVIL)', 'CAPRO', 'FLOW CLASICO HD',
  'FLOW FULL CON DECO', 'FLOW FULL SIN DECO', 'FLOW (+) CON DECO',
  'FLOW (+) SIN DECO', 'COMBO CLASICO HD', 'COMBO FULL CON DECO',
  'COMBO FULL SIN DECO', 'COMBO FLOW (+)  CON DECO', 'COMBO FLOW (+)  SIN DECO',
  'INTERNET', 'CAMARA'
];
const unificacionOptions = [
  'No Corresponde (no tiene serv. Para unificar)', 'Si Corresponde - Dio Error',
  'No Corresponde (cte no quiso unificar)', 'Gestionado Ok'
];
const provinciaOptions = [
  'OTRA', 'Posada Misiones (Misiones)', 'San fernando del valle de Catamarca (Catamarca)',
  'San Salvador de Jujuy (Jujuy)', 'Santiago del Estero (Capital)', 'Salta (Capital)'
];
const promoOptions = [
  'NO', 'Internet 300MB', 'Intemet 300MB + Flow Full sin dec',
  'Internet 300 MB-Flow Full con dec', 'Internet 300MB+ cámara Smarthom',
  'Internet 300 MB + low Full sin deco + cámara Smarthome'
];
const flowSinDecoOptions = [
  'Se activa en Línea', 'No se activa - Problema de herramientas',
  'No se activa - Cte no acepta activarlo en el caso', 'N/A',
];
// --- End Options Lists ---


export const SheetTable = ({ config, user, onShowConfig }) => {

  // Ref to store the representative name (prioritizing historical over current login)
  const historicalRepName = useRef(user?.name || user?.email || representanteOptions[0]); // Fallback to first option if user info missing

  // --- Row Template Function ---
  // Dynamically creates a template using the potentially updated historicalRepName
  const today = new Date();
  const createNewRowTemplate = () => ({
    id: Date.now(), // Unique ID for React key
    year: today.getFullYear(),
    month: String(today.getMonth() + 1).padStart(2, '0'),
    day: String(today.getDate()).padStart(2, '0'),
    servicio: 'HOGAR',
    lider: 'AYLEN GONZALEZ',
    representante: historicalRepName.current, // Use name from ref
    producto: productoOptions[0], // Default to empty product selection
    dni: '',
    gestion: '',
    caso_yoizen: '',
    flow_sin_deco: flowSinDecoOptions[0], // Default to first option
    unificacion: unificacionOptions[0], // Default to first option
    provincia: provinciaOptions[0], // Default to 'OTRA'
    promo_tactica: promoOptions[0], // Default to 'NO'
  });

  // --- Component State ---
  const [rows, setRows] = useState([]); // Start empty, will be populated by useEffect
  const [status, setStatus] = useState('Cargando datos guardados...');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHiddenColumns, setShowHiddenColumns] = useState(false);
  const [initialRowCount, setInitialRowCount] = useState(0); // Tracks initially loaded rows

  // --- Load User's Data Effect ---
  useEffect(() => {
    if (user && user.email) {
      loadData(user.email)
        .then(savedRows => {
          let repNameFromHistory = null;
          if (savedRows && savedRows.length > 0) {
            // Get representative name from the first saved row, if available
            if (savedRows[0].representante) {
              repNameFromHistory = savedRows[0].representante;
            }

            // Determine the final representative name (history > current user > default)
            // Ensure the name exists in the options list for the dropdown
            const finalRepName = repNameFromHistory || user?.name || user?.email || representanteOptions[0];
            if (!representanteOptions.includes(finalRepName)) {
                // If the name isn't standard, log a warning but still use it
                console.warn(`Nombre de representante "${finalRepName}" no encontrado en las opciones estándar.`);
                // Optionally, add it to the options list dynamically if needed:
                // if(!representanteOptions.find(opt => opt === finalRepName)) representanteOptions.push(finalRepName);
            }
            historicalRepName.current = finalRepName; // Update the ref

            // Prepare rows for state
            const rowsWithUniqueIds = savedRows.map(r => ({...r, id: r.id || Math.random()}));
            setRows(rowsWithUniqueIds);
            setInitialRowCount(savedRows.length); // Record initial count
            setStatus(`Datos cargados (${savedRows.length} filas propias). Rep: ${historicalRepName.current}`);
          } else {
            // No saved data, determine rep name based on current user
            historicalRepName.current = user?.name || user?.email || representanteOptions[0];
             if (!representanteOptions.includes(historicalRepName.current)) {
                console.warn(`Nombre de representante "${historicalRepName.current}" no encontrado en las opciones estándar.`);
             }
            // Start with one blank row using the template
            const firstRow = createNewRowTemplate();
            setRows([firstRow]);
            setInitialRowCount(0);
            setStatus(`No tienes datos guardados. Rep: ${historicalRepName.current}. Listo para cargar.`);
          }
        })
        .catch(err => {
          // Handle errors during data loading
          console.error("Error loading data:", err);
          setStatus('❌ Error al cargar tus datos guardados.');
          // Use current user info even on error
          historicalRepName.current = user?.name || user?.email || representanteOptions[0];
          if (!representanteOptions.includes(historicalRepName.current)) {
               console.warn(`Nombre de representante "${historicalRepName.current}" no encontrado en las opciones estándar.`);
           }
          const firstRow = createNewRowTemplate();
          setRows([firstRow]);
          setInitialRowCount(0);
        });
    }
  // Disabling exhaustive-deps check as we only want this to run when 'user' changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Rerun if the user object changes

  // --- Table Interaction Functions ---

  // Update state when an input/select field changes
  const handleInputChange = (index, fieldName, value) => {
    const newRows = rows.map((row, i) => {
      if (i === index) {
        return { ...row, [fieldName]: value };
      }
      return row;
    });
    setRows(newRows);
  };

  // Add a new row using the template (which uses the stored rep name)
  const addRow = () => {
    setRows([...rows, createNewRowTemplate()]);
  };

// Remove a specific row by its index WITH CONFIRMATION
  const removeRow = (index) => {
    if (rows.length < 1) return;

    // --- ¡NUEVO! ---
    // Pide confirmación al usuario
    const userConfirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la fila ${index + 1}?`
    );

    // Si el usuario no confirma, no hacer nada
    if (!userConfirmed) {
      return;
    }
    // --- FIN NUEVO ---

    // Si confirma, proceder con la lógica de eliminación
    const newRows = rows.filter((_, i) => i !== index);
    if (index < initialRowCount) {
        setInitialRowCount(prevCount => Math.max(0, prevCount - 1));
    }
    if (newRows.length === 0) {
        setRows([createNewRowTemplate()]);
    } else {
        setRows(newRows);
    }
  };

  // --- Data Validation ---
  const isValidDate = (y, m, d) => {
    if (!y || !m || !d) return false;
    const date = new Date(y, m - 1, d);
    return (
      date.getFullYear() === parseInt(y) &&
      date.getMonth() === m - 1 &&
      date.getDate() === parseInt(d)
    );
  };

  // --- Data Submission Functions ---

  // Helper: Submit one row to Google Form via iframe
  const submitRowToGoogle = (formData) => {
    return new Promise((resolve, reject) => {
      let iframe = null;
      let form = null;
      try {
        const iframeName = 'hidden_iframe_' + Date.now();
        iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
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

        setTimeout(() => {
          if (form && form.parentNode) form.parentNode.removeChild(form);
          if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
          resolve();
        }, 800);

      } catch (error) {
        if (form && form.parentNode) form.parentNode.removeChild(form);
        if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
        reject(error);
      }
    });
  };

  // Main submit handler
  const handleSubmitAll = async (e) => {
    e.preventDefault();

    // Filter rows: valid date, not empty, and product selected (not the placeholder)
    const validRows = rows.filter(row => {
        const isEmptyRow = !row.producto && !row.dni && !row.gestion && !row.caso_yoizen;
        // Check if product is selected (it's not the initial empty string)
        const isProductSelected = row.producto && row.producto !== productoOptions[0];
        return isValidDate(row.year, row.month, row.day) && !isEmptyRow && isProductSelected;
    });

    if (validRows.length === 0) {
        let reason = "No hay filas con datos válidos";
        if (rows.length > 0 && !rows.some(r => r.producto && r.producto !== productoOptions[0])) {
            reason += " (asegúrate de seleccionar un 'Producto')";
        }
        setStatus(reason + ' para enviar o guardar.');
        return;
    }

    // Identify which of the valid rows are actually new additions
    const rowsToSendToForm = validRows.filter((row) => {
        const currentIndex = rows.findIndex(r => r.id === row.id);
        // Rows with index >= initialRowCount are considered new
        return currentIndex >= initialRowCount;
    });

    // Cleanup old iframes
    const oldIframes = document.querySelectorAll('iframe[name^="hidden_iframe_"]');
    oldIframes.forEach(iframe => {
        if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
    });

    setIsSubmitting(true);
    setStatus(`⏳ Enviando ${rowsToSendToForm.length} nuevas filas al formulario...`);

    let submittedCount = 0;
    let submissionErrors = [];
    const { entries } = config;

    // --- 1. Submit ONLY NEW rows to Google Form ---
    for (let i = 0; i < rowsToSendToForm.length; i++) {
        const row = rowsToSendToForm[i];
        const originalIndex = rows.findIndex(r => r.id === row.id);
        setStatus(`⏳ Enviando fila ${originalIndex + 1} al formulario...`);

        const rowFormData = new FormData();
        const finalDateString = `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`;
        rowFormData.append(entries.fecha, finalDateString);
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
            console.error(`Error enviando fila ${originalIndex + 1} al formulario:`, error);
            submissionErrors.push(originalIndex + 1);
        }
    }

    // --- Process results ---
    let formSubmitMessage = submittedCount > 0
        ? `✅ ${submittedCount} de ${rowsToSendToForm.length} nuevas filas enviadas al formulario.`
        : (rowsToSendToForm.length > 0 ? `❌ No se pudieron enviar ${rowsToSendToForm.length} nuevas filas al formulario.` : 'No había filas nuevas para enviar al formulario.');

    if (submissionErrors.length > 0) {
      formSubmitMessage += ` Fallo el envío para filas UI: ${submissionErrors.join(', ')}.`;
    }

    // --- 2. Save ALL valid rows (old + new) to Google Sheet ---
    try {
      setStatus(`💾 Guardando ${validRows.length} filas en la base de datos...`);
      await saveData(validRows, user.email);
      const savedRowsWithIds = validRows.map(r => ({...r, id: r.id || Math.random()}))
      setRows(savedRowsWithIds.length > 0 ? savedRowsWithIds : [createNewRowTemplate()]);
      setInitialRowCount(savedRowsWithIds.length); // Update count after saving
      setStatus(formSubmitMessage + ` ✅ ${validRows.length} filas guardadas.`);
    } catch (err) {
      console.error('Error al guardar en DB:', err);
      setStatus(formSubmitMessage + ' ❌ Error al guardar datos.');
    }

    setIsSubmitting(false);
  };

  // --- JSX Rendering ---
  return (
    <div>
      <button onClick={onShowConfig} className="config-button">
        ⚙️
      </button>

      <div className="user-info">
        Logueado como: {user.name} ({user.email})
      </div>

      <h2>Cargador de Datos a Google Form</h2>
      <h3>ANTES DE ENVIAR CUALQUIER VENTA, ES NECESARIO QUE NO HAYAS DEJADO NINGUNA OPCION SELECCIONADA EN EL BDU</h3>
      <h3>SI HAY ALGUNA OPCION SELECCIONADA, POR FAVOR DESMARCARLA ANTES DE CONTINUAR.</h3>
      <form onSubmit={handleSubmitAll}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="sheet-table">
            <thead>
              <tr>
                {/* --- Headers (Year is conditional) --- */}
                {showHiddenColumns && <th>Año</th>}
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
              {rows.length === 0 ? (
                 // Adjust colspan based on visible columns
                <tr key="no-data-row"><td colSpan={showHiddenColumns ? 15 : 9}>Cargando o no hay datos. Añade una fila para comenzar.</td></tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id}>
                    {/* --- Date Inputs (Year is conditional) --- */}
                    {showHiddenColumns && (
                       <td>
                        <input type="number" value={row.year || ''} onChange={(e) => handleInputChange(index, 'year', e.target.value)} placeholder="Año" required />
                      </td>
                    )}
                    <td><input type="number" value={row.month || ''} onChange={(e) => handleInputChange(index, 'month', e.target.value)} placeholder="Mes" min="1" max="12" required /></td>
                    <td><input type="number" value={row.day || ''} onChange={(e) => handleInputChange(index, 'day', e.target.value)} placeholder="Día" min="1" max="31" required /></td>

                    {/* --- Hidden Fixed Columns --- */}
                    {showHiddenColumns && (
                      <>
                        <td><input type="text" value={row.servicio || ''} disabled /></td>
                        <td><input type="text" value={row.lider || ''} disabled /></td>
                      </>
                    )}

                    {/* --- REPRESENTANTE (Dropdown) --- */}
                    <td>
                      <select value={row.representante || ''} onChange={(e) => handleInputChange(index, 'representante', e.target.value)} required>
                        {/* Ensure the current value is an option, even if not in the default list */}
                        {!representanteOptions.includes(row.representante || '') && row.representante &&
                           <option value={row.representante} >{row.representante}</option>
                        }
                        {representanteOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                      </select>
                    </td>

                    {/* --- PRODUCTO (Dropdown with Placeholder) --- */}
                    <td>
                      <select value={row.producto || ''} onChange={(e) => handleInputChange(index, 'producto', e.target.value)} required>
                         {/* Placeholder Option */}
                         {productoOptions[0] === '' && <option value="" disabled>Seleccionar producto...</option>}
                        {/* Map other options, skipping the empty one if it was used as placeholder */}
                        {productoOptions.filter(opt => opt !== '').map(option => (<option key={option} value={option}>{option}</option>))}
                      </select>
                    </td>

                    {/* --- DNI, GESTION, CASO (Text Inputs) --- */}
                    <td><input type="text" value={row.dni || ''} onChange={(e) => handleInputChange(index, 'dni', e.target.value)} placeholder="DNI del cliente" required /></td>
                    <td><input type="text" value={row.gestion || ''} onChange={(e) => handleInputChange(index, 'gestion', e.target.value)} placeholder="N° de Gestión" required /></td>
                    <td><input type="text" value={row.caso_yoizen || ''} onChange={(e) => handleInputChange(index, 'caso_yoizen', e.target.value)} placeholder="N° de Caso" required /></td>

                    {/* --- FLOW SIN DECO (Dropdown) --- */}
                    <td>
                      <select value={row.flow_sin_deco || flowSinDecoOptions[0]} onChange={(e) => handleInputChange(index, 'flow_sin_deco', e.target.value)}>
                        {flowSinDecoOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                      </select>
                    </td>

                    {/* --- Other Hidden Columns --- */}
                    {showHiddenColumns && (
                      <>
                        {/* --- UNIFICACION (Dropdown) --- */}
                        <td>
                          <select value={row.unificacion || unificacionOptions[0]} onChange={(e) => handleInputChange(index, 'unificacion', e.target.value)} required>
                            {unificacionOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                          </select>
                        </td>
                        {/* --- PROVINCIA (Dropdown) --- */}
                        <td>
                          <select value={row.provincia || provinciaOptions[0]} onChange={(e) => handleInputChange(index, 'provincia', e.target.value)} required>
                            {provinciaOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                          </select>
                        </td>
                         {/* --- PROMO TACTICA (Dropdown) --- */}
                        <td>
                           <select value={row.promo_tactica || promoOptions[0]} onChange={(e) => handleInputChange(index, 'promo_tactica', e.target.value)} required>
                            {promoOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                          </select>
                        </td>
                      </>
                    )}
                    {/* --- Remove Button --- */}
                    <td>
                      <button type="button" onClick={() => removeRow(index)}>
                        &times;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Action Buttons Below Table --- */}
        <div className="table-actions">
          <div>
            <button type="button" onClick={addRow} style={{ marginRight: '10px' }}>
              + Añadir Fila
            </button>
            <button type="button" onClick={() => setShowHiddenColumns(!showHiddenColumns)}>
              {showHiddenColumns ? 'Ocultar Opciones' : 'Mostrar Opciones'}
            </button>
          </div>
          {/* Disable submit if sending or no valid rows exist */}
          <button type="submit" disabled={isSubmitting || !rows.some(row => isValidDate(row.year, row.month, row.day) && row.producto && row.producto !== productoOptions[0])}>
            {isSubmitting ? 'Enviando...' : `Enviar y Guardar ${rows.filter(row => isValidDate(row.year, row.month, row.day) && row.producto && row.producto !== productoOptions[0]).length} Filas Válidas`}
          </button>
        </div>
      </form>
      {/* --- Status Message Area --- */}
      <p id="status">{status}</p>
    </div>
  );
}