import { useEffect, useState } from "react";
import { listenToTurnos } from "../services/agendaService";

export function useAgenda() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToTurnos(
      (data) => {
        setTurnos(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  return { turnos, loading, error };
}
