// ================================
// 1. Datos y elementos del DOM
// ================================

let pedidos = [];
let siguienteId = 1;

const formulario = document.getElementById("form-pedido");
const productoInput = document.getElementById("producto");
const precioInput = document.getElementById("precio");
const cantidadInput = document.getElementById("cantidad");
const mensaje = document.getElementById("mensaje");
const filtro = document.getElementById("filtro");
const listaPedidos = document.getElementById("lista-pedidos");
const totalElemento = document.getElementById("total");

// ================================
// 2. Modelo de cada pedido
// ================================

function crearPedido(producto, precio, cantidad) {
    return {
        id: siguienteId++,
        producto: producto,
        precio: precio,
        cantidad: cantidad,
        estado: "pendiente",

        subtotal() {
            return this.precio * this.cantidad;
        },

        marcarEntregado() {
            this.estado = "entregado";
        }
    };
}

// ================================
// 3. Renderizado seguro de la lista
// ================================

function render() {
    // Vacía los elementos anteriores sin interpretar HTML.
    listaPedidos.textContent = "";

    const pedidosFiltrados = pedidos.filter(pedido => {
        return filtro.value === "todos" || pedido.estado === filtro.value;
    });

    if (pedidosFiltrados.length === 0) {
        const vacio = document.createElement("li");
        vacio.className = "vacio";
        vacio.textContent = "No hay pedidos para mostrar.";
        listaPedidos.appendChild(vacio);
    }

    pedidosFiltrados.forEach(pedido => {
        const elemento = document.createElement("li");
        elemento.className = "pedido";

        const informacion = document.createElement("div");
        informacion.className = "pedido-info";

        const nombre = document.createElement("p");
        nombre.className = "pedido-nombre";

        // IMPORTANTE: textContent trata el nombre como texto, no como HTML.
        nombre.textContent = pedido.producto;

        const detalle = document.createElement("p");
        detalle.className = "pedido-detalle";
        detalle.textContent =
            `S/ ${pedido.precio.toFixed(2)} × ${pedido.cantidad} = S/ ${pedido.subtotal().toFixed(2)}`;

        const estado = document.createElement("span");
        estado.className = `estado estado-${pedido.estado}`;
        estado.textContent = pedido.estado;

        informacion.appendChild(nombre);
        informacion.appendChild(detalle);
        informacion.appendChild(estado);

        const acciones = document.createElement("div");
        acciones.className = "acciones";

        const botonEntregar = document.createElement("button");
        botonEntregar.type = "button";
        botonEntregar.className = "boton boton-entregar";
        botonEntregar.textContent = "Entregar";
        botonEntregar.dataset.accion = "entregar";
        botonEntregar.dataset.id = pedido.id;
        botonEntregar.disabled = pedido.estado === "entregado";

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "boton boton-eliminar";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.dataset.accion = "eliminar";
        botonEliminar.dataset.id = pedido.id;

        acciones.appendChild(botonEntregar);
        acciones.appendChild(botonEliminar);

        elemento.appendChild(informacion);
        elemento.appendChild(acciones);
        listaPedidos.appendChild(elemento);
    });

    // El total considera todos los pedidos, aunque se esté aplicando un filtro.
    const total = pedidos.reduce((acumulado, pedido) => {
        return acumulado + pedido.subtotal();
    }, 0);

    totalElemento.textContent = `S/ ${total.toFixed(2)}`;
}

// ================================
// 4. Evento submit y validaciones
// ================================

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const producto = productoInput.value.trim();
    const precioTexto = precioInput.value;
    const cantidadTexto = cantidadInput.value;

    const precio = Number(precioTexto);
    const cantidad = Number(cantidadTexto);

    if (producto === "") {
        mensaje.textContent = "Ingrese el nombre del producto.";
        productoInput.focus();
        return;
    }

    if (precioTexto === "" || !Number.isFinite(precio) || precio <= 0) {
        mensaje.textContent = "El precio debe ser un número mayor que cero.";
        precioInput.focus();
        return;
    }

    if (cantidadTexto === "" || !Number.isInteger(cantidad) || cantidad < 0) {
        mensaje.textContent = "Ingrese una cantidad entera igual o mayor que cero.";
        cantidadInput.focus();
        return;
    }

    const nuevoPedido = crearPedido(producto, precio, cantidad);
    pedidos.push(nuevoPedido);

    mensaje.textContent = "Pedido agregado correctamente.";
    formulario.reset();
    filtro.value = "todos";
    render();
});

// ================================
// 5. Delegación de eventos
// ================================

listaPedidos.addEventListener("click", function(event) {
    const boton = event.target.closest("button");

    // Ignora clics que no provengan de un botón.
    if (!boton || !listaPedidos.contains(boton)) {
        return;
    }

    const id = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    const pedido = pedidos.find(p => p.id === id);

    if (!pedido) {
        return;
    }

    if (accion === "entregar") {
        pedido.marcarEntregado();
        mensaje.textContent = "Pedido marcado como entregado.";
    } else if (accion === "eliminar") {
        pedidos = pedidos.filter(p => p.id !== id);
        mensaje.textContent = "Pedido eliminado correctamente.";
    } else {
        return;
    }

    render();
});

// ================================
// 6. Evento change del filtro
// ================================

filtro.addEventListener("change", render);

// Dibuja el estado inicial de la aplicación.
render();
