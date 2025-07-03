// TareaInteligenteAsync.js
// Componente avanzado para ejecución de tareas resilientes y autocorrectivas
// Uso de async/await para buen manejo de errores y lógica de reintentos

/**
 * Crea una tarea inteligente que se puede ejecutar con reintentos y manejo de errores.
 * 
 * @param {Object} opciones - Configuración de la tarea.
 * @param {string} opciones.nombre - Nombre de la tarea (usado para logging).
 * @param {Object} opciones.configuracion - Parámetros de configuración (reintentos, demora, modo silencioso).
 * @param {Function} opciones.ejecutar - Función asíncrona a ejecutar.
 * @param {Function} [opciones.despues] - Función de callback a ejecutar si la tarea tiene éxito.
 * 
 * @returns {Object} Un objeto con el método iniciar().
 */
function TareaInteligente({ nombre, configuracion, ejecutar, despues }) {
  async function iniciar() {
    const config = prepararConfiguracion(configuracion);

    try {
      const resultado = await ejecutarConResiliencia(ejecutar, config);
      if (despues) despues(resultado);
    } catch (error) {
      logError(error, nombre);
    }
  }

  return { iniciar };
}

/**
 * Prepara la configuración asegurando valores por defecto.
 * 
 * @param {Object} config - Configuración original.
 * @returns {Object} Configuración normalizada con valores por defecto.
 */
function prepararConfiguracion(config) {
  return {
    ...config,
    maxIntentos: config.reintentos || 3,
    silencio: config.modoSilencioso || false,
  };
}

/**
 * Ejecuta una función asíncrona con reintentos en caso de fallos.
 * 
 * @param {Function} funcion - Función asíncrona a ejecutar.
 * @param {Object} config - Configuración de reintentos.
 * @returns {Promise<any>} Resultado de la función si tiene éxito.
 * @throws {Error} Si todos los intentos fallan.
 */
async function ejecutarConResiliencia(funcion, config) {
  let intentos = 0;
  while (intentos < config.maxIntentos) {
    try {
      return await funcion();
    } catch (e) {
      intentos++;
      if (!config.silencio) console.warn(`Intento ${intentos} fallido.`);
      await esperar(config.demoraEntreIntentos || 1000);
    }
  }
  throw new Error("Todos los intentos fallaron.");
}

/**
 * Espera una cantidad de milisegundos.
 * 
 * @param {number} ms - Milisegundos a esperar.
 * @returns {Promise<void>}
 */
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Muestra un error con el nombre de la tarea.
 * 
 * @param {Error} error - Error capturado.
 * @param {string} nombreTarea - Nombre de la tarea para el log.
 */
function logError(error, nombreTarea) {
  console.error(`Error en la tarea '${nombreTarea}':`, error);
}

// ---------------------------------------------------------------------------
// Ejemplo de uso de TareaInteligente

const tarea = new TareaInteligente({
  nombre: "Cargar datos de productos",
  configuracion: {
    reintentos: 3,
    demoraEntreIntentos: 1500,
    modoSilencioso: false
  },
  ejecutar: async () => {
    const datos = await fetch("/api/productos").then(r => r.json());
    return datos;
  },
  despues: (resultado) => {
    console.log("Datos cargados con éxito:", resultado);
  }
});

// Ejecutar la tarea inteligente
tarea.iniciar();