// src/services/configuracionService.js
// A diferencia de los otros módulos, Configuración no es una "lista" sino un
// único nodo con los datos generales de la peluquería.

import { ref, get, set, onValue } from "firebase/database";
import { db } from "../firebase/config";

const PATH = "configuracion/general";

export const CONFIG_DEFAULT = {
  nombre: "",
  logo: "",
  direccion: "",
  telefono: "",
  horario: "",
  instagram: "",
  facebook: "",
  whatsapp: "",
  metodosPago: "",
  impuestoPorc: 0,
};

export function listenToConfiguracion(callback, onError) {
  const r = ref(db, PATH);
  return onValue(
    r,
    (snap) => {
      callback(snap.exists() ? { ...CONFIG_DEFAULT, ...snap.val() } : CONFIG_DEFAULT);
    },
    (error) => {
      console.error("Error leyendo configuración:", error);
      if (onError) onError(error);
    }
  );
}

export async function getConfiguracion() {
  const snap = await get(ref(db, PATH));
  return snap.exists() ? { ...CONFIG_DEFAULT, ...snap.val() } : CONFIG_DEFAULT;
}

export async function saveConfiguracion(data) {
  await set(ref(db, PATH), data);
}
