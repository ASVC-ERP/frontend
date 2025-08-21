import { createPortal } from "react-dom";
import { useRef, useLayoutEffect, useState } from "react";

function SuggestionList({ anchorRef, suggestions, onSelect }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [anchorRef, suggestions]);

  if (!suggestions?.length) return null;

  return createPortal(
    <ul
      className="list-group mt-2"
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 99999, // ✅ floats above modal
        maxHeight: "200px",
        overflowY: "auto",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "0.375rem",
      }}
    >
      {suggestions.map((s, idx) => (
        <li
          key={idx}
          className="list-group-item list-group-item-action"
          style={{ cursor: "pointer" }}
          onClick={() => onSelect(s)}
        >
          {s.itemName}{" "}
          <small className="text-muted">({s.itemCode})</small>
        </li>
      ))}
    </ul>,
    document.getElementById("suggestions-portal")
  );
}

export default SuggestionList;