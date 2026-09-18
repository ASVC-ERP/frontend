import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Fetches /reports/<path> whenever range (or extraParams) changes.
// extraParams: plain object merged into the query string, e.g. { limit: 100 }.
// Returns { data, loading, error }.
export function useReportData(path, range, extraParams) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const extraKey = JSON.stringify(extraParams || {});

  useEffect(() => {
    if (!range.from || !range.to) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    axios
      .get(`${API_URL}/reports/${path}`, {
        params: { from: range.from, to: range.to, ...JSON.parse(extraKey) },
      })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load report");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path, range.from, range.to, extraKey]);

  return { data, loading, error };
}
