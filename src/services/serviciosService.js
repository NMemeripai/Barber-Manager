// src/services/serviciosService.js
import { createDoc, updateDocById, deleteDocById, listenToCollection, getAllDocs } from "../firebase/database";

const PATH = "servicios";

export const SERVICIO_DEFAULT = {
  nombre: "",
  precio: 0,
  duracion: 30, // minutos
  descripcion: "",
  activo: true,
};

export function listenToServicios(callback, onError) {
  return listenToCollection(PATH, callback, onError);
}

export async function getServicios() {
  return getAllDocs(PATH);
}

export async function crearServicio(data) {
  return createDoc(PATH, data);
}

export async function actualizarServicio(id, data) {
  return updateDocById(PATH, id, data);
}

export async function eliminarServicio(id) {
  return deleteDocById(PATH, id);
}
