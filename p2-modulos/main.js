
import { pedidos, calcularTotal, actualizarPedido } from "./pedidos.js";
import { mostrarPedidos } from "./ui.js";

const listaActualizada = actualizarPedido(pedidos, 0, {
  cliente: "Ana Sofia"
});

mostrarPedidos(listaActualizada);

const resumen = calcularTotal(listaActualizada);

document.querySelector("#base").textContent = resumen.base.toFixed(2);
document.querySelector("#igv").textContent = resumen.impuesto.toFixed(2);
document.querySelector("#total").textContent = resumen.total.toFixed(2);

console.log("Pedidos:", listaActualizada);
console.log("Resumen:", resumen);
console.log("Módulos conectados correctamente");
console.log("Clase Pedido:", typeof listaActualizada[0].constructor);
console.log("Total calculado:", resumen.total);