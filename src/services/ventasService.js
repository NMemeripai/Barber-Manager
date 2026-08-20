// src/services/ventasService.js
import { ref, get, update, push } from "firebase/database";
import { db } from "../firebase/config";
import { serverTimestamp, listenToCollection, getAllDocs } from "../firebase/database";

const PATH = "ventas";

export const VENTA_DEFAULT = {
  clienteId: null,
  clienteNombre: "Consumidor final",
  items: [], // [{ tipo: 'servicio'|'producto', id, nombre, precio, cantidad }]
  descuentoPorc: 0,
  metodoPago: "efectivo",
  observaciones: "",
  subtotal: 0,
  descuento: 0,
  total: 0,
  ganancia: 0,
};

export function listenToVentas(callback, onError) {
  return listenToCollection(PATH, callback, onError);
}

export async function getVentas() {
  return getAllDocs(PATH);
}

export function calcularTotales(items, descuentoPorc, productosMap) {
  const subtotal = items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const descuento = Math.round((subtotal * (Number(descuentoPorc) || 0)) / 100);
  const total = subtotal - descuento;

  const ganancia = items.reduce((acc, it) => {
    if (it.tipo === "producto" && productosMap?.[it.id]) {
      const costo = Number(productosMap[it.id].costo) || 0;
      return acc + (it.precio - costo) * it.cantidad;
    }
    // Los servicios se consideran 100% ganancia (no tienen costo de insumo cargado)
    return acc + it.precio * it.cantidad;
  }, 0);

  return { subtotal, descuento, total, ganancia };
}

/**
 * Elimina una venta por su ID y revierte todo lo que esa venta había
 * generado, sin tocar el catálogo (servicios/productos) ni al cliente:
 *  - Borra únicamente el registro de la venta (por ID, nunca por nombre/fecha).
 *  - Devuelve al stock la cantidad de cada producto vendido en esa venta.
 *  - Recalcula visitas/totalGastado/ultimaVisita del cliente a partir de
 *    sus ventas restantes (no resta a mano, para evitar que quede una
 *    estadística "fantasma" si hubo ediciones manuales previas).
 * Todo se aplica en un único multi-path update atómico.
 */
export async function eliminarVenta(ventaId) {
  if (!ventaId) throw new Error("Falta el ID de la venta a eliminar.");

  const ventaSnap = await get(ref(db, `${PATH}/${ventaId}`));
  if (!ventaSnap.exists()) {
    throw new Error("La venta no existe o ya fue eliminada.");
  }
  const venta = ventaSnap.val();
  const updates = {};

  // 1) Eliminar el registro de la venta (por ID)
  updates[`${PATH}/${ventaId}`] = null;

  // 2) Devolver stock de los productos vendidos en esa venta (el producto
  //    en sí, del catálogo, nunca se toca)
  for (const item of venta.items || []) {
    if (item.tipo === "producto") {
      const productoSnap = await get(ref(db, `productos/${item.id}`));
      if (productoSnap.exists()) {
        const stockActual = Number(productoSnap.val().stock) || 0;
        updates[`productos/${item.id}/stock`] = stockActual + (Number(item.cantidad) || 0);
      }
    }
  }

  // 3) Recalcular estadísticas del cliente (el cliente en sí nunca se toca)
  if (venta.clienteId) {
    const clienteSnap = await get(ref(db, `clientes/${venta.clienteId}`));
    if (clienteSnap.exists()) {
      const todasSnap = await get(ref(db, PATH));
      const todas = todasSnap.exists() ? todasSnap.val() : {};
      const ventasRestantes = Object.entries(todas)
        .filter(([id, v]) => id !== ventaId && v.clienteId === venta.clienteId)
        .map(([, v]) => v);

      const visitas = ventasRestantes.length;
      const totalGastado = ventasRestantes.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
      const ultimaVisita =
        ventasRestantes.reduce((max, v) => (v.creadoEn && v.creadoEn > max ? v.creadoEn : max), 0) ||
        null;

      updates[`clientes/${venta.clienteId}/visitas`] = visitas;
      updates[`clientes/${venta.clienteId}/totalGastado`] = totalGastado;
      updates[`clientes/${venta.clienteId}/ultimaVisita`] = ultimaVisita;
    }
  }

  await update(ref(db), updates);
}

/**
 * Confirma una venta: crea el registro, descuenta stock de productos
 * involucrados, y actualiza visitas/totalGastado/ultimaVisita del cliente,
 * todo en un único multi-path update atómico de Realtime Database.
 */
export async function confirmarVenta(venta, productosActuales) {
  const updates = {};

  // 1) Nueva venta
  const ventaRef = push(ref(db, PATH));
  updates[`${PATH}/${ventaRef.key}`] = {
    ...venta,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  };

  // 2) Descontar stock de productos vendidos
  for (const item of venta.items) {
    if (item.tipo === "producto") {
      const actual = productosActuales.find((p) => p.id === item.id);
      const stockNuevo = Math.max(0, (Number(actual?.stock) || 0) - item.cantidad);
      updates[`productos/${item.id}/stock`] = stockNuevo;
    }
  }

  // 3) Actualizar estadísticas del cliente (si no es consumidor final)
  if (venta.clienteId) {
    const clienteSnap = await get(ref(db, `clientes/${venta.clienteId}`));
    const clienteActual = clienteSnap.exists() ? clienteSnap.val() : {};
    updates[`clientes/${venta.clienteId}/visitas`] = (Number(clienteActual.visitas) || 0) + 1;
    updates[`clientes/${venta.clienteId}/totalGastado`] =
      (Number(clienteActual.totalGastado) || 0) + venta.total;
    updates[`clientes/${venta.clienteId}/ultimaVisita`] = Date.now();
  }

  await update(ref(db), updates);
  return ventaRef.key;
}
