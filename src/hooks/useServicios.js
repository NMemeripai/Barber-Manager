import { useEffect, useState } from "react";
import { listenToServicios } from "../services/serviciosService";

export function useServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToServicios(
      (data) => {
        setServicios(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  return { servicios, loading, error };
}
