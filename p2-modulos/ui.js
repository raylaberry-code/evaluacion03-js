
export function mostrarPedidos(pedidos) {
  const lista = document.querySelector("#lista");
  const resultado = document.querySelector("#resultado");

  lista.textContent = "";

  pedidos.forEach((pedido) => {
    const elemento = document.createElement("li");
    elemento.textContent =
      `${pedido.producto} - S/ ${pedido.precio} x ${pedido.cantidad}`;
    lista.appendChild(elemento);
  });

  resultado.textContent = "Pedidos cargados correctamente.";
}
