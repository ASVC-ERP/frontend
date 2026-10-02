import { useState } from "react";
import axios from "axios";
import Panel from "./Panel";

const API_URL = import.meta.env.VITE_API_URL;

// Sends this report's (already-anonymized, server-side) numbers to Gemini's
// free tier and shows back a short written analysis. Nothing is sent until
// the user clicks the button.
export default function AiInsightsPanel({ reportPath, range }) {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/reports/${reportPath}/insights`, {
        params: { from: range.from, to: range.to },
      });
      setInsights(res.data.insights);
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
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{insights}</div>
      )}
    </Panel>
  );
}
