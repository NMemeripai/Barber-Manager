import { useEffect, useState } from "react";
import { listenToVentas } from "../services/ventasService";

export function useVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToVentas(
      (data) => {
        setVentas(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  return { ventas, loading, error };
}
