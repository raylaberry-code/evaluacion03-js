
export const IGV = 0.18;

export class Pedido {
  constructor({ producto, precio, cantidad = 1, cliente = "Sin cliente" }) {
    this.producto = producto;
    this.precio = precio;
    this.cantidad = cantidad;
    this.cliente = cliente;
  }

  subtotal() {
    return this.precio * this.cantidad;
  }
}

export const pedidos = [
  new Pedido({ producto: "Café", precio: 6, cantidad: 2, cliente: "Ana" }),
  new Pedido({ producto: "Croissant", precio: 4.5, cantidad: 0 }),
  new Pedido({ producto: "Jugo", precio: 8 })
];

export function calcularTotal(lista) {
  const base = lista.reduce(
    (total, pedido) => total + (pedido.precio * pedido.cantidad),
    0
  );

  const impuesto = base * IGV;

  return {
    base,
    impuesto,
    total: base + impuesto
  };
}


export function actualizarPedido(lista, indice, cambios) {
  return lista.map((pedido, i) =>
    i === indice ? { ...pedido, ...cambios } : pedido
  );
}
