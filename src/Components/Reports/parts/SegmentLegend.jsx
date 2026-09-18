import { useEffect, useRef, useState } from "react";
import { TbInfoCircle } from "react-icons/tb";
import { SEGMENT_LABEL } from "../segment";

// Keep in sync with the rules in ../segment.js (segmentFor).
const SEGMENT_INFO = [
  { key: "vip", desc: "Ranked in the top 3 by revenue in this range." },
  { key: "new", desc: "Their very first-ever sale falls in this date range." },
  { key: "steady", desc: "Active and recent, just outside the top 3." },
  { key: "at_risk", desc: "Last order was more than 45 days before the range end." },
];

// Small info button next to the "Segment" column header that pops open a
// legend explaining what each badge means. Click-toggle (not hover) so it
// works on touch too; closes on outside click.
export default function SegmentLegend() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <span className="segment-legend" ref={wrapRef}>
      <button
        type="button"
        className="segment-legend-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="What do the segment tags mean?"
        title="What do the segment tags mean?"
      >
        <TbInfoCircle size={15} />
      </button>
      {open && (
        <div className="segment-legend-pop">
          <div className="segment-legend-title">Segment guide</div>
          {SEGMENT_INFO.map((s) => (
            <div key={s.key} className="segment-legend-row">
              <span className={`seg-badge seg-${s.key}`}>{SEGMENT_LABEL[s.key]}</span>
              <span className="segment-legend-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}
