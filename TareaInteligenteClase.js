// TareaInteligenteClase.js
// Clase moderna ES2022, para ejecución de tareas resilientes con Promesas (then/catch)
// Implementación orientada a objetos (OOP) con métodos privados y reintentos automáticos

/**
 * Clase que representa una tarea inteligente con lógica de reintentos,
 * control de errores y opción de callback al finalizar.
 */
class TareaInteligente {
  /**
   * @param {Object} opciones - Parámetros de configuración de la tarea.
   * @param {string} opciones.nombre - Nombre de la tarea.
   * @param {Object} opciones.configuracion - Configuración avanzada.
   * @param {Function} opciones.ejecutar - Función que retorna una Promesa (la tarea principal).
   * @param {Function} [opciones.despues] - Callback opcional a ejecutar tras el éxito.
   */
  constructor({ nombre, configuracion, ejecutar, despues }) {
    this.nombre = nombre || "TareaSinNombre";
    this.config = this.#prepararConfiguracion(configuracion || {});
    this.ejecutar = ejecutar;
    this.despues = despues;
  }

  /**
   * Inicia la ejecución de la tarea con reintentos y control de errores.
   * 
   * @returns {Promise<any>} Resultado de la ejecución o error si todos los intentos fallan.
   */
  iniciar() {
    return this.#ejecutarConResiliencia(this.ejecutar, this.config)
      .then((resultado) => {
        if (this.despues) this.despues(resultado);
        return resultado;
      })
      .catch((error) => {
        console.error(`Error en la tarea '${this.nombre}':`, error);
        return Promise.reject(error);
      });
  }

  // -------------------------
  // Métodos privados (ES2022)
  // -------------------------

  /**
   * Normaliza la configuración con valores por defecto.
   * 
   * @param {Object} conf - Configuración original.
   * @returns {Object} Configuración preparada.
   */
  #prepararConfiguracion(conf) {
    return {
      maxIntentos: conf.reintentos || 3,
      demoraEntreIntentos: conf.demoraEntreIntentos || 1000,
      silencio: conf.modoSilencioso || false
    };
  }

  /**
   * Espera un número determinado de milisegundos.
   * 
   * @param {number} ms - Milisegundos a esperar.
   * @returns {Promise<void>}
   */
  #esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Ejecuta una función con lógica de reintentos y espera entre fallos.
   * 
   * @param {Function} funcion - Función que retorna una Promesa.
   * @param {Object} conf - Configuración de reintentos.
   * @returns {Promise<any>} Resultado exitoso o rechazo tras múltiples fallos.
   */
  #ejecutarConResiliencia(funcion, conf) {
    let intentos = 0;

    const intentar = () => {
      return funcion()
        .catch((error) => {
          intentos++;
          if (!conf.silencio) {
            console.warn(`Intento ${intentos} fallido:`, error);
          }
          if (intentos < conf.maxIntentos) {
            return this.#esperar(conf.demoraEntreIntentos).then(intentar);
          }
          return Promise.reject(new Error("Todos los intentos fallaron."));
        });
    };

    return intentar();
  }
}

// ---------------------------------------------------------------------------
// Ejemplo de uso

const tarea = new TareaInteligente({
  nombre: "Cargar datos de productos",
  configuracion: {
    reintentos: 3,
    demoraEntreIntentos: 1500,
    modoSilencioso: false
  },
  ejecutar: function () {
    return fetch("/api/productos")
      .then(function (response) {
        return response.json();
      });
  },
  despues: function (resultado) {
    console.log("Datos cargados con éxito:", resultado);
  }
});

tarea.iniciar()
  .then(function () {
    console.log("Tarea completada correctamente.");
  })
  .catch(function () {
    console.log("La tarea no pudo completarse después de los intentos.");
  });
