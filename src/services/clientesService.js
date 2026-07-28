// src/services/clientesService.js
import { createDoc, updateDocById, deleteDocById, listenToCollection, getAllDocs, getDocById } from "../firebase/database";

const PATH = "clientes";

export const CLIENTE_DEFAULT = {
  nombre: "",
  telefono: "",
  email: "",
  notas: "",
  vip: false,
  activo: true,
  visitas: 0,
  totalGastado: 0,
  ultimaVisita: null,
};

export function listenToClientes(callback, onError) {
  return listenToCollection(PATH, callback, onError);
}

export async function getClientes() {
  return getAllDocs(PATH);
}

export async function getCliente(id) {
  return getDocById(PATH, id);
}

export async function crearCliente(data) {
  return createDoc(PATH, data);
}

export async function actualizarCliente(id, data) {
  return updateDocById(PATH, id, data);
}

export async function eliminarCliente(id) {
  return deleteDocById(PATH, id);
}
