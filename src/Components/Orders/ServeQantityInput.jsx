import { useState } from "react";

function ServeQuantityInput({ 
  item, 
  index, 
  quantityToServe, 
  updateServeQuantity 
}) {
  const [tempValue, setTempValue] = useState(quantityToServe ?? "");
  const [showWarning, setShowWarning] = useState(false);

  const maxQty = Math.min(item.quantity, item.products.stock);

  const handleChange = (e) => {
    const value = e.target.value;

    // allow empty input for easy typing
    if (value === "") {
      setTempValue("");
      updateServeQuantity(index, "");
      setShowWarning(false);
      return;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) return;

    setTempValue(value);

    // show warning if exceeding max
    setShowWarning(parsed > maxQty);
  };

  const handleBlur = () => {
    let parsed = Number(tempValue || 0);

    // clamp value
    const clamped = Math.max(0, Math.min(parsed, maxQty));

    setTempValue(clamped); // update local input
    updateServeQuantity(index, clamped);

    setShowWarning(clamped < parsed); // true if original value was too high
  };

  return (
    <div className="d-flex flex-column align-items-start">
      <input
        type="number"
        min={0}
        max={maxQty}
        value={tempValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onWheel={(e) => e.target.blur()}
        className={`form-control text-center ${showWarning ? "border-warning" : ""}`}
        style={{ width: "100px" }}
        placeholder="0"
      />
      {showWarning && (
        <small className="text-warning mt-1">
          Max allowed: {maxQty}
        </small>
      )}
    </div>
  );
}

export default ServeQuantityInput;
