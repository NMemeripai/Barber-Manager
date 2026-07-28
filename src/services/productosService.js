// src/services/productosService.js
import { createDoc, updateDocById, deleteDocById, listenToCollection, getAllDocs } from "../firebase/database";

const PATH = "productos";

export const PRODUCTO_DEFAULT = {
  nombre: "",
  marca: "",
  categoria: "",
  codigo: "",
  proveedor: "",
  imagen: "",
  precio: 0,
  costo: 0,
  stock: 0,
  stockMinimo: 5,
  activo: true,
};

export function listenToProductos(callback, onError) {
  return listenToCollection(PATH, callback, onError);
}

export async function getProductos() {
  return getAllDocs(PATH);
}

export async function crearProducto(data) {
  return createDoc(PATH, data);
}

export async function actualizarProducto(id, data) {
  return updateDocById(PATH, id, data);
}

export async function eliminarProducto(id) {
  return deleteDocById(PATH, id);
}

export function calcularGanancia(precio, costo) {
  const p = Number(precio) || 0;
  const c = Number(costo) || 0;
  if (p === 0) return 0;
  return Math.round(((p - c) / p) * 100);
}
