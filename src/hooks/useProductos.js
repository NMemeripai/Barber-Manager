import { useEffect, useState } from "react";
import { listenToProductos } from "../services/productosService";

export function useProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToProductos(
      (data) => {
        setProductos(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  return { productos, loading, error };
}
