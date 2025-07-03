# 🧠 TareaInteligente – Gestión Asíncrona Resiliente

Una colección de componentes diseñados para ejecutar tareas asincrónicas con reintentos, control de errores y comportamiento posterior personalizado.  
Ideado como parte de la arquitectura inteligente de [BotellaControl](https://medium.com/@fernandofa0306/botellacontrol-inventario-inteligente-de-licores-con-ia-8fc8caabac18).

---

## 🚀 Características principales

- Reintentos automáticos con espera entre intentos.
- Separación clara entre lógica principal y acciones posteriores.
- Registro de errores personalizado con nombre de tarea.
- Opcionalmente silencioso (modo sin log de errores).
- Ideal para procesos que pueden fallar: cargas remotas, APIs, etc.

---

## 📂 Contenido

| Archivo | Descripción |
|--------|-------------|
| `TareaInteligenteAsync.js` | Versión moderna con `async/await` y estructura funcional. |
| `TareaInteligenteClase.js` | Implementación orientada a objetos (ES2022). |
| `TareaInteligenteLiteral.js` | Versión con objeto literal y manejo de Promesas (`then/catch`). |

---

## 💻 Ejemplo de uso

```js
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

tarea.iniciar();


---

## 🙋‍♂️ Autor
**Fernando Flores Alvarado**  
🔗 [LinkedIn](https://www.linkedin.com/in/fernando-flores-alvarado-2786b21b8/)  
📖 [Ver más publicaciones en Medium](https://medium.com/@fernandofa0306)

> “No todas las tareas deben ser perfectas, pero sí deben ser inteligentes.” 🧠✨

---
