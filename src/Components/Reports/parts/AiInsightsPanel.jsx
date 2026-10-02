import { useEffect, useState } from "react";
import axios from "axios";
import Panel from "./Panel";

const API_URL = import.meta.env.VITE_API_URL;

// Sends this report's (already-anonymized, server-side) numbers to Gemini's
// free tier and shows back a short written analysis. Nothing is sent until
// the user clicks the button. The last result for this exact date range is
// cached server-side, so it reloads here instead of starting empty.
export default function AiInsightsPanel({ reportPath, range }) {
  const [insights, setInsights] = useState("");
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!range.from || !range.to) return;
    let cancelled = false;
    setError("");
    axios
      .get(`${API_URL}/reports/${reportPath}/insights`, {
        params: { from: range.from, to: range.to },
      })
      .then((res) => {
        if (cancelled) return;
        setInsights(res.data?.insights || "");
        setGeneratedAt(res.data?.generated_at || null);
      })
      .catch(() => {
        if (!cancelled) {
          setInsights("");
          setGeneratedAt(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reportPath, range.from, range.to]);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/reports/${reportPath}/insights`, null, {
        params: { from: range.from, to: range.to },
      });
      setInsights(res.data.insights);
      setGeneratedAt(res.data.generated_at);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to generate insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel
      title="AI Insights"
      action={
        <button
          className="btn-secondary-custom"
          disabled={loading || !range.from || !range.to}
          onClick={generate}
        >
          {loading ? "Analyzing..." : insights ? "Regenerate" : "Generate"}
        </button>
      }
    >
      {error && <div style={{ color: "#c0392b" }}>{error}</div>}

      {!error && !insights && !loading && (
        <div className="report-panel-empty">
          Only aggregated totals go out for this — names of customers and
          suppliers are replaced with generic ranks before anything is sent
          to Gemini.
        </div>
      )}

      {insights && (
        <>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{insights}</div>
          {generatedAt && (
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 12 }}>
              Last generated: {new Date(generatedAt).toLocaleString()}
            </div>
          )}
        </>
      )}
    </Panel>
  );
}
