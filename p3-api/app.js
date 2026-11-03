
const formulario = document.querySelector("#form-clima");
const inputCiudad = document.querySelector("#ciudad");
const btnBuscar = document.querySelector("#btn-buscar");
const mensaje = document.querySelector("#mensaje");
const resultado = document.querySelector("#resultado");

const comparacion = document.querySelector("#comparacion");
const tablaMediciones = document.querySelector("#tabla-mediciones");
const resultadoPromesas = document.querySelector("#resultado-promesas");

const ciudades = ["Lima", "Cusco", "Arequipa"];

// 1. Buscar las coordenadas de una ciudad.
async function buscarCiudad(nombre) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nombre)}&count=1&language=es&format=json`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`Error al buscar la ciudad: HTTP ${respuesta.status}`);
  }

  const datos = await respuesta.json();

  if (!datos.results || datos.results.length === 0) {
    throw new Error(`No se encontró la ciudad "${nombre}".`);
  }

  return datos.results[0];
}

// 2. Consultar el clima con las coordenadas.
async function obtenerClima(ciudad) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${ciudad.latitude}&longitude=${ciudad.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&wind_speed_unit=kmh&timezone=auto`;

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`Error al consultar el clima: HTTP ${respuesta.status}`);
  }

  const datos = await respuesta.json();

  if (!datos.current) {
    throw new Error("La API no devolvió datos actuales del clima.");
  }

  return {
    ciudad: ciudad.name,
    temperatura: datos.current.temperature_2m,
    humedad: datos.current.relative_humidity_2m,
    viento: datos.current.wind_speed_10m
  };
}

// 3. Primero busca la ciudad y después consulta el clima.
async function consultarClima(nombre) {
  const ciudad = await buscarCiudad(nombre);
  return obtenerClima(ciudad);
}

// 4. Mostrar el clima en la página.
function mostrarClima(clima) {
  resultado.textContent = "";

  const titulo = document.createElement("h3");
  titulo.textContent = clima.ciudad;

  const temperatura = document.createElement("p");
  temperatura.textContent = `Temperatura: ${clima.temperatura} °C`;

  const humedad = document.createElement("p");
  humedad.textContent = `Humedad: ${clima.humedad}%`;

  const viento = document.createElement("p");
  viento.textContent = `Viento: ${clima.viento} km/h`;

  resultado.append(titulo, temperatura, humedad, viento);
}

// 5. Consultar una ciudad desde el formulario.
formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nombre = inputCiudad.value.trim();

  if (!nombre) {
    mensaje.textContent = "Escribe el nombre de una ciudad.";
    return;
  }

  btnBuscar.disabled = true;
  mensaje.textContent = "Consultando el clima...";
  resultado.textContent = "";

  try {
    const clima = await consultarClima(nombre);
    mostrarClima(clima);
    mensaje.textContent = "Consulta completada correctamente.";
  } catch (error) {
    mensaje.textContent = error.message === "Failed to fetch"
      ? "No se pudo conectar. Revisa tu conexión a Internet."
      : error.message;
  } finally {
    btnBuscar.disabled = false;
  }
});

// 6. Consultas secuenciales: una después de otra.
async function consultaSecuencial() {
  const inicio = performance.now();
  const datos = [];

  for (const nombre of ciudades) {
    const clima = await consultarClima(nombre);
    datos.push(clima);
  }

  const tiempo = performance.now() - inicio;

  return { datos, tiempo };
}

// 7. Consultas paralelas: todas al mismo tiempo.
async function consultaParalela() {
  const inicio = performance.now();

  const datos = await Promise.all(
    ciudades.map(nombre => consultarClima(nombre))
  );

  const tiempo = performance.now() - inicio;

  return { datos, tiempo };
}

// 8. Mostrar resultados de las consultas.
function mostrarComparacion(datos, tiempo, titulo) {
  comparacion.textContent = "";

  const encabezado = document.createElement("h3");
  encabezado.textContent = titulo;

  const tiempoTexto = document.createElement("p");
  tiempoTexto.textContent = `Tiempo total: ${tiempo.toFixed(2)} ms`;

  comparacion.append(encabezado, tiempoTexto);

  datos.forEach(clima => {
    const elemento = document.createElement("p");
    elemento.textContent =
      `${clima.ciudad}: ${clima.temperatura} °C, humedad ${clima.humedad}%`;
    comparacion.appendChild(elemento);
  });
}

// 9. Botón de consulta secuencial.
document.querySelector("#btn-secuencial").addEventListener("click", async (event) => {
  const boton = event.currentTarget;
  boton.disabled = true;
  comparacion.textContent = "Consultando ciudades una por una...";

  try {
    const resultado = await consultaSecuencial();

    mostrarComparacion(
      resultado.datos,
      resultado.tiempo,
      "Consulta secuencial"
    );
  } catch (error) {
    comparacion.textContent = error.message;
  } finally {
    boton.disabled = false;
  }
});

// 10. Botón de consulta paralela.
document.querySelector("#btn-paralelo").addEventListener("click", async (event) => {
  const boton = event.currentTarget;
  boton.disabled = true;
  comparacion.textContent = "Consultando las ciudades al mismo tiempo...";

  try {
    const resultado = await consultaParalela();

    mostrarComparacion(
      resultado.datos,
      resultado.tiempo,
      "Consulta paralela con Promise.all"
    );
  } catch (error) {
    comparacion.textContent = error.message;
  } finally {
    boton.disabled = false;
  }
});

// 11. Medir tres veces ambos métodos.
document.querySelector("#btn-mediciones").addEventListener("click", async (event) => {
  const boton = event.currentTarget;
  boton.disabled = true;

  comparacion.textContent = "Realizando las tres mediciones...";
  tablaMediciones.textContent = "";

  try {
    for (let i = 1; i <= 3; i++) {
      const secuencial = await consultaSecuencial();
      const paralelo = await consultaParalela();

      const fila = document.createElement("tr");

      const numero = document.createElement("td");
      numero.textContent = `Medición ${i}`;

      const tiempoSecuencial = document.createElement("td");
      tiempoSecuencial.textContent = secuencial.tiempo.toFixed(2);

      const tiempoParalelo = document.createElement("td");
      tiempoParalelo.textContent = paralelo.tiempo.toFixed(2);

      fila.append(numero, tiempoSecuencial, tiempoParalelo);
      tablaMediciones.appendChild(fila);
    }

    comparacion.textContent = "Las tres mediciones finalizaron correctamente.";
  } catch (error) {
    comparacion.textContent = error.message;
  } finally {
    boton.disabled = false;
  }
});

// 12. Comparar Promise.all con una ciudad inválida.
document.querySelector("#btn-all").addEventListener("click", async (event) => {
  const boton = event.currentTarget;
  boton.disabled = true;
  resultadoPromesas.textContent = "Ejecutando Promise.all...";

  try {
    const datos = await Promise.all([
      consultarClima("Lima"),
      consultarClima("Cusco"),
      consultarClima("Xyzabc")
    ]);

    resultadoPromesas.textContent =
      `Todas las consultas funcionaron: ${datos.length}`;
  } catch (error) {
    resultadoPromesas.textContent =
      `Promise.all rechazó la operación: ${error.message}`;
  } finally {
    boton.disabled = false;
  }
});

// 13. Promise.allSettled permite revisar cada resultado.
document.querySelector("#btn-allsettled").addEventListener("click", async (event) => {
  const boton = event.currentTarget;
  boton.disabled = true;
  resultadoPromesas.textContent = "Ejecutando Promise.allSettled...";

  try {
    const nombres = ["Lima", "Cusco", "Xyzabc"];

    const resultados = await Promise.allSettled(
      nombres.map(nombre => consultarClima(nombre))
    );

    resultadoPromesas.textContent = "";

    resultados.forEach((item, indice) => {
      const elemento = document.createElement("p");

      if (item.status === "fulfilled") {
        elemento.textContent =
          `${nombres[indice]}: ${item.value.temperatura} °C - Correcto`;
      } else {
        elemento.textContent =
          `${nombres[indice]}: Error - ${item.reason.message}`;
      }

      resultadoPromesas.appendChild(elemento);
    });
  } finally {
    boton.disabled = false;
  }
});

console.log("Sistema de consulta del clima iniciado.");
