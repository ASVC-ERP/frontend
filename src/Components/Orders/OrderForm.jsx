import React from "react";
import { IoIosSearch } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";

const normalizeCode = (value) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const partNumberKey = (product) => {
  if (product.part_num) return normalizeCode(product.part_num);
  if (!product.item_code) return null;
  return normalizeCode(product.item_code).replace(/[a-z]+$/, "");
};

const BRAND_COLORS = [
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#dcfce7", text: "#166534" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#ffedd5", text: "#9a3412" },
  { bg: "#cffafe", text: "#155e75" },
];

const brandColor = (brand) => {
  let hash = 0;
  for (let i = 0; i < brand.length; i++) hash = (hash * 31 + brand.charCodeAt(i)) >>> 0;
  return BRAND_COLORS[hash % BRAND_COLORS.length];
};

function OrderForm({
  query,
  suggestions,
  orderItems,
  onSearchChange,
  onSelectProduct,
  onPriceChange,
  onEnableCustomPrice,
  onDisableCustomPrice,
  onUpdateOrderItem,
  onCalculateTotal,
  onCalculateTotalPrice,
  onDeleteItem,
}) {
  const partNumberCounts = suggestions.reduce((counts, product) => {
    const key = partNumberKey(product);
    if (key) counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  const hasAmbiguousMatches = Object.values(partNumberCounts).some(
    (count) => count > 1
  );

  return (
    <div>
      {/* Search Input */}
      <div className="row justify-content-between">
        <div className="position-relative w-75 ms-2">
          <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted" />
          <input
            type="text"
            placeholder="Search inventory"
            value={query}
            onChange={onSearchChange}
            className="form-control form-control-sm ps-5 border-2 rounded-3"
          />
          {suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: 0,
                right: 0,
                marginLeft: "10px",
                width: "98%",
                zIndex: 1000,
              }}
            >
              {hasAmbiguousMatches && (
                <div
                  style={{
                    background: "#fff7e6",
                    border: "1px solid #f5c451",
                    color: "#8a5a00",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    marginBottom: "6px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                  }}
                >
                  ⚠ Multiple items share this part number — check the brand/code before selecting.
                </div>
              )}

              <ul
                style={{
                  backgroundColor: "#fff",
                  border: "2px solid #6c757d",
                  listStyleType: "none",
                  margin: 0,
                  padding: 0,
                  maxHeight: "400px",
                  overflowY: "auto",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                {suggestions.map((items, index) => {
                  const key = partNumberKey(items);
                  const isAmbiguous = key && partNumberCounts[key] > 1;
                  const color = items.brand ? brandColor(items.brand) : null;

                  return (
                    <li
                      key={index}
                      onClick={() => onSelectProduct(items)}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        background: isAmbiguous ? "#fffaf0" : undefined,
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <span>
                          <IoIosSearch className="me-2" />
                          <strong>{items.itemName}</strong>
                        </span>

                        {items.brand && (
                          <span
                            style={{
                              flexShrink: 0,
                              fontSize: "12.5px",
                              fontWeight: 700,
                              padding: "5px 12px",
                              borderRadius: "999px",
                              backgroundColor: color.bg,
                              color: color.text,
                            }}
                          >
                            {items.brand}
                          </span>
                        )}
                      </div>

                      <div>
                        {items.item_code} • Stock: {items.stock}
                      </div>

                      {isAmbiguous && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "4px",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            color: "#8a5a00",
                            background: "#ffe9b3",
                            borderRadius: "999px",
                            padding: "2px 8px",
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                          }}
                        >
                          ⚠ multiple matches — check brand
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Order Table */}
      <div className="row justify-content-between mx-2 mt-3">
        <div style={{ maxHeight: "550px", overflowY: "auto" }}>
          <table className="table transparent-table custom-border-table text-center fw-semibold">
            <thead
              className="custom-header-color bg-light"
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#E8E7EC",
                zIndex: 2,
              }}
            >
              <tr>
                <th className="text-start col-4">Product</th>
                <th className="col-1" title="Enter number of units">
                  Quantity
                </th>
                <th className="col-2" title="Unit of measurement">
                  UOM
                </th>
                <th className="col-3" title="Choose unit price">
                  Price
                </th>
                <th className="col-2" title="Final total after discount">
                  Total
                </th>
                <th className="col-1"></th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, idx) => (
                <tr key={idx}>
                  {/* Product column */}
                  <td className="text-start">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex flex-column">
                        <span className="fw-semibold">{item.itemName}</span>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "bold",
                            color:
                              item.stock < 5
                                ? "#B64345"
                                : item.stock >= 5 && item.stock < 10
                                  ? "#F8B13D"
                                  : "#ACACAC",
                          }}
                        >
                          In stock: {item.stock} {item.unit}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td>
                    <input
                      type="text"
                      value={item.quantity}
                      min="1"
                      max={item.stock}
                      onChange={(e) =>
                        onUpdateOrderItem(
                          idx,
                          "quantity",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="form-control mx-auto d-block w-75 text-center"
                    />
                  </td>

                  {/* UOM */}
                  <td>
                    <input
                      type="text"
                      value={item.unit}
                      className="form-control mx-auto d-block w-50 text-center"
                      readOnly
                    />
                  </td>

                  {/* Price */}
                  <td>
                    {item.customPriceEnabled ? (
                      <div className="input-group w-50 mx-auto">
                        <input
                          type="number"
                          className="form-control text-center w-50"
                          value={item.customPrice || ""}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) =>
                            onPriceChange(idx, e.target.value, true)
                          }
                          placeholder="Enter price"
                          style={{ fontSize: "14px" }}
                        />
                        <button
                          type="button"
                          className="btn border-top border-bottom border-end border-0 bg-white"
                          title="Back to list"
                          onClick={() => onDisableCustomPrice(idx)}
                        >
                          <IoChevronDown />
                        </button>
                      </div>
                    ) : (
                      <select
                        className="form-select mx-auto d-block w-50"
                        value={
                          item.customPriceEnabled
                            ? "custom"
                            : item.selectedMarkup
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "custom") {
                            onEnableCustomPrice(idx);
                          } else {
                            onPriceChange(idx, value);
                          }
                        }}
                      >
                        <option value="price1">₱{item.price1}</option>
                        <option value="price2">₱{item.price2}</option>
                        <option value="price3">₱{item.price3}</option>
                        <option value="price4">₱{item.price4}</option>
                        <option value="custom">Custom...</option>
                      </select>
                    )}
                  </td>

                  {/* Total */}
                  <td className="align-middle">
                    <span>₱</span>
                    <span>
                      {onCalculateTotal(item).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </td>

                  {/* Delete */}
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onDeleteItem(idx)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Price */}
      <div className="row mt-3 me-5 text-end">
        <p className="h5 fw-bold">
          Total: ₱
          {onCalculateTotalPrice().toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
}

export default OrderForm;
