// TareaInteligente.js
// Componente avanzado para ejecución de tareas resilientes y autocorrectivas
// Implementado con objeto literal y Promesas (then/catch)

/**
 * Objeto que representa una tarea inteligente con lógica de reintentos,
 * espera entre intentos y manejo de errores.
 */
var TareaInteligente = {

  // *******************************************************
  //                    Propiedades
  // *******************************************************
  /** @type {string|null} Nombre descriptivo de la tarea */
  nombre: null,
  /** @type {Object} Configuración de la tarea (reintentos, demora, modo silencioso) */
  configuracion: {},
  /** @type {Function|null} Función principal que retorna una Promesa */
  ejecutar: null,
  /** @type {Function} Callback a ejecutar si la tarea finaliza correctamente */
  despues: null,
  /** @type {number} Contador de intentos realizados */
  _intentosRealizados: 0,

  // *******************************************************
  //                    Métodos
  // *******************************************************
  /**
   * Configura los parámetros de la tarea inteligente.
   * 
   * @param {Object} config - Objeto de configuración.
   * @param {string} config.nombre - Nombre de la tarea.
   * @param {Object} config.configuracion - Configuración detallada.
   * @param {Function} config.ejecutar - Función que retorna una Promesa.
   * @param {Function} [config.despues] - Función de éxito opcional.
   */
  configurar: function(config) {
    this.nombre = config.nombre || "TareaSinNombre";
    this.configuracion = {
      reintentos: config.configuracion.reintentos || 3,
      demoraEntreIntentos: config.configuracion.demoraEntreIntentos || 1000,
      modoSilencioso: config.configuracion.modoSilencioso || false
    };
    this.ejecutar = config.ejecutar;
    this.despues = config.despues || function() {};
  },

  /**
   * Espera una cantidad de milisegundos indicada.
   * 
   * @param {number} ms - Milisegundos a esperar.
   * @returns {Promise<void>}
   */
  esperar: function(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  },

  /**
   * Intenta ejecutar la función con lógica de reintentos.
   * 
   * @returns {Promise<any>} Resultado si tiene éxito o error tras varios intentos.
   */
  _intentarEjecucion: function() {
    var self = this;

    return this.ejecutar()
      .catch(function(error) {
        self._intentosRealizados++;
        if (!self.configuracion.modoSilencioso) {
          console.warn(`Intento ${self._intentosRealizados} fallido en '${self.nombre}'.`);
        }

        if (self._intentosRealizados < self.configuracion.reintentos) {
          return self.esperar(self.configuracion.demoraEntreIntentos).then(function() {
            return self._intentarEjecucion();
          });
        }

        return Promise.reject(new Error("Todos los intentos fallaron."));
      });
  },

  /**
   * Inicia la tarea inteligente.
   * 
   * @returns {Promise<any>} Resultado final o error.
   */
  iniciar: function() {
    var self = this;
    this._intentosRealizados = 0;

    return this._intentarEjecucion()
      .then(function(resultado) {
        self.despues(resultado);
        return resultado;
      })
      .catch(function(error) {
        console.error(`Error en la tarea '${self.nombre}':`, error);
        return Promise.reject(error);
      });
  }
};

// ---------------------------------------------------------------------------
// Ejemplo de uso

// Configurar tarea
TareaInteligente.configurar({
  nombre: "Cargar datos de productos",
  configuracion: {
    reintentos: 3,
    demoraEntreIntentos: 1500,
    modoSilencioso: false
  },
  ejecutar: function() {
    return fetch("/api/productos")
      .then(function(response) { return response.json(); });
  },
  despues: function(resultado) {
    console.log("Datos cargados con éxito:", resultado);
  }
});

// Ejecutar la tarea
TareaInteligente.iniciar()
  .then(function() {
    console.log("Tarea completada correctamente.");
  })
  .catch(function() {
    console.log("La tarea no pudo completarse después de los intentos.");
  });
