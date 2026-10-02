import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Splits the model's plain-text reply into paragraphs and bullet groups so
// it reads like a written analysis instead of one wall of text.
function renderInsights(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks = [];
  let bullets = null;

  for (const line of lines) {
    const bullet = line.match(/^[-*•]\s+(.*)/);
    if (bullet) {
      if (!bullets) {
        bullets = [];
        blocks.push(bullets);
      }
      bullets.push(bullet[1]);
    } else {
      bullets = null;
      blocks.push(line);
    }
  }

  return blocks.map((block, i) =>
    Array.isArray(block) ? (
      <ul className="ai-insights-list" key={i}>
        {block.map((item, j) => (
          <li key={j}>{item}</li>
        ))}
      </ul>
    ) : (
      <p key={i}>{block}</p>
    ),
  );
}

// Per-report, per-browser -- just a convenience so a hidden panel stays
// hidden across visits. Not meant to sync across devices/users.
function collapsedKey(reportPath) {
  return `ai-insights-collapsed:${reportPath}`;
}

export default function AiInsightsPanel({ reportPath, range }) {
  const [insights, setInsights] = useState("");
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(collapsedKey(reportPath)) === "1";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(collapsedKey(reportPath), next ? "1" : "0");
      } catch {
        // localStorage unavailable (private mode, etc.) -- just keep it in memory.
      }
      return next;
    });
  };

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
    <div className="ai-insights">
      <div className="ai-insights-head">
        <div className="ai-insights-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2.5l1.8 4.9 4.9 1.8-4.9 1.8L12 15.9l-1.8-4.9-4.9-1.8 4.9-1.8L12 2.5z"
              fill="currentColor"
            />
            <path
              d="M19 14.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z"
              fill="currentColor"
            />
          </svg>
          <span>AI Insights</span>
          <span className="ai-beta-badge">Beta</span>
        </div>

        <div className="ai-insights-actions">
          {!collapsed && (
            <button
              className="btn-secondary-custom"
              disabled={loading || !range.from || !range.to}
              onClick={generate}
            >
              {loading ? "Analyzing…" : insights ? "Regenerate" : "Generate"}
            </button>
          )}
          <button
            type="button"
            className="ai-insights-toggle"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
          >
            {collapsed ? "Show" : "Hide"}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="ai-insights-body">
            {error && <div className="ai-insights-error">{error}</div>}

            {loading && (
              <div className="ai-insights-loading">
                <span className="ai-spinner" aria-hidden="true" />
                Reading your {reportPath} numbers and writing up the analysis…
              </div>
            )}

            {!loading && !error && !insights && (
              <div className="ai-insights-empty">
                Only aggregated totals go out for this — names of customers and
                suppliers are replaced with generic ranks before anything is sent
                to Gemini.
              </div>
            )}

            {!loading && insights && (
              <div className="ai-insights-text">{renderInsights(insights)}</div>
            )}
          </div>

          {!loading && insights && generatedAt && (
            <div className="ai-insights-meta">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 7v5l3.5 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Last generated {new Date(generatedAt).toLocaleString()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
