// src/services/api.js

/**
 * Llama a una función del backend de Google Apps Script y devuelve una Promesa.
 * Esto asume que estás en el entorno de GAS (después de compilar).
 * En desarrollo (localhost), devolverá un mock.
 */

// --- ¡NUEVA! API de Métricas ---
export const getUserMetrics = (userEmail) => {
  return callGoogleScript('calculateUserMetrics', userEmail);
};

const callGoogleScript = (functionName, ...args) => {
  // Comprobamos si `google.script.run` existe
  if (window.google && window.google.script && window.google.script.run) {
    return new Promise((resolve, reject) => {
      window.google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [functionName](...args);
    });
  } else {
    // --- MODO DE DESARROLLO (localhost) ---
    // No estamos en GAS, así que devolvemos datos falsos (mock)
    console.warn(`Modo de desarrollo: Simulando llamada a ${functionName}`);
    if (functionName === 'getUserInfo') {
      return Promise.resolve({ email: 'dev@localhost.com', name: 'Dev User' });
    }
    if (functionName === 'loadData') {
      return Promise.resolve([]); // Devuelve un array vacío
    }
    if (functionName === 'saveData') {
      return Promise.resolve({ status: 'ok_mock', rowsSaved: args[0].length });
    }
    return Promise.reject(new Error('google.script.run no está disponible.'));
  }
};

// --- API de Autenticación ---
export const getUserInfo = () => {
  return callGoogleScript('getUserInfo');
};

// --- API de Base de Datos ---
export const loadData = (userEmail) => { // <-- ¡PARÁMETRO NUEVO!
  return callGoogleScript('loadData', userEmail); // <-- Pasa el email
};

export const saveData = (rows, userEmail) => {
  return callGoogleScript('saveData', rows, userEmail);
};