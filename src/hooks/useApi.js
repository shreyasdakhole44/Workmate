import { useState, useEffect } from "react";

export function useApi(fn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fn();
      setData(r.data.data);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, deps);

  return { data, loading, error, reload: load };
}
