import { useEffect, useState } from "react";
import { listenToClientes } from "../services/clientesService";

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToClientes(
      (data) => {
        setClientes(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  return { clientes, loading, error };
}
