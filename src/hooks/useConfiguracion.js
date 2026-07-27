import { useEffect, useState } from "react";
import { listenToConfiguracion, CONFIG_DEFAULT } from "../services/configuracionService";

export function useConfiguracion() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsubscribe = listenToConfiguracion(
      (data) => {
        setConfig(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setConfig(CONFIG_DEFAULT);
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  return { config, loading, error };
}
