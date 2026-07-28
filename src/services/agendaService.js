// src/services/agendaService.js
import { createDoc, updateDocById, deleteDocById, listenToCollection, getAllDocs } from "../firebase/database";

const PATH = "turnos";

export const ESTADOS_TURNO = ["Pendiente", "Confirmado", "Cancelado", "Finalizado"];

export const TURNO_DEFAULT = {
  clienteId: null,
  clienteNombre: "",
  servicioId: null,
  servicioNombre: "",
  fecha: "", // YYYY-MM-DD
  hora: "", // HH:MM
  estado: "Pendiente",
  notas: "",
};

export function listenToTurnos(callback, onError) {
  return listenToCollection(PATH, callback, onError);
}

export async function getTurnos() {
  return getAllDocs(PATH);
}

export async function crearTurno(data) {
  return createDoc(PATH, data);
}

export async function actualizarTurno(id, data) {
  return updateDocById(PATH, id, data);
}

export async function eliminarTurno(id) {
  return deleteDocById(PATH, id);
}

export async function cambiarEstadoTurno(id, estado) {
  return updateDocById(PATH, id, { estado });
}
