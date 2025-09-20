import React from 'react';
import { IoIosSearch } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import defaultPic from "../../assets/defaultPic.jpg"

function OrderForm({query, suggestions, orderItems, onSearchChange, onSelectProduct, onPriceChange, onUpdateOrderItem, onCalculateTotal, onCalculateTotalPrice, onDeleteItem}) {
   

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
            <ul
              style={{
                position: "absolute",
                top: "40px",
                left: 0,
                right: 0,
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderTop: "none",
                listStyleType: "none",
                margin: 0,
                marginLeft: "10px",
                padding: 0,
                zIndex: 1000,
                maxHeight: "200px",
                overflowY: "auto",
                borderRadius: "0.5rem",
                width: "98%",
              }}
            >
              {suggestions.map((items, index) => (
                <li
                  key={index}
                  onClick={() => onSelectProduct(items)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>{items.itemName}</strong> <br />
                  Stock: {items.stock}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Order Table */}
      <div className="row justify-content-between mx-2 mt-3">
        <div style={{ maxHeight: "250px", overflowY: "auto" }}>
          <table className="table transparent-table custom-border-table text-center fw-semibold">
            <thead
              className="custom-header-color"
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "",
              }}
            >
              <tr>
                <th className="text-start col-3">Product</th>
                <th className="col-2">Price</th>
                <th className="col-1"></th>
                <th className="col-1">Quantity</th>
                <th className="col-1">Total</th>
                <th className="col-1"></th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, idx) => (
                <tr key={idx}>
                  {/* Product column */}
                  <td className="text-start">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={defaultPic}
                        alt="Product"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
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
                          In stock: {item.stock} pcs
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td>
                    <select
                      className="form-select mx-auto d-block w-50"
                      value={item.selectedMarkup}
                      onChange={(e) => onPriceChange(idx, e.target.value)}
                    >
                      <option value="price1">₱{item.price?.price1}</option>
                      <option value="price2">₱{item.price?.price2}</option>
                      <option value="price3">₱{item.price?.price3}</option>
                      <option value="price4">₱{item.price?.price4}</option>
                    </select>
                  </td>

                  <td style={{ color: "#ACACAC" }}>X</td>

                  {/* Quantity */}
                  <td className="col-1">
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      max={item.stock}
                      onChange={(e) =>
                        onUpdateOrderItem(
                          idx,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="form-control mx-auto d-block w-75 text-center"
                    />
                  </td>
                  {/* Total */}
                  <td>
                    <span>₱</span>
                    <span>
                      {(
                        onCalculateTotal(item) - (item.discount || 0)
                      ).toLocaleString(undefined, {
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
        <p className="h4 fw-bold">
          Total: ₱
          {onCalculateTotalPrice().toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
}

export default OrderForm
