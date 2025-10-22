// src/services/api.js

/**
 * Llama a una función del backend de Google Apps Script y devuelve una Promesa.
 * @param {string} functionName El nombre de la función en tu .gs
 * @param {any[]} args Los argumentos para la función
 * @returns {Promise<any>}
 */
const callGoogleScript = (functionName, ...args) => {
  return new Promise((resolve, reject) => {
    // 'google.script.run' es inyectado por el backend de Google Apps Script
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [functionName](...args);
  });
};

// --- API de Persistencia ---

export const loadData = () => {
  return callGoogleScript('loadData');
};

export const saveData = (rows) => {
  return callGoogleScript('saveData', rows);
};