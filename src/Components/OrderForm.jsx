import React from 'react';
import { IoIosSearch } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import defaultPic from "../assets/defaultPic.jpg"
import Swal from 'sweetalert2'

function OrderForm({query, suggestions, orderItems, onSearchChange, onSelectProduct, onPriceChange, onUpdateOrderItem, onCalculateTotal, onCalculateTotalPrice, onRemoveProduct}) {
   

    return (
        <div>
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
                                position: 'absolute',
                                top: '40px',
                                left: 0,
                                right: 0,
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderTop: 'none',
                                listStyleType: 'none',
                                margin: 0,
                                marginLeft: "10px",
                                padding: 0,
                                zIndex: 1000,
                                maxHeight: '200px', // Set a fixed max height
                                overflowY: 'auto', // Make it scrollable vertically
                                borderRadius: '0.5rem', // Optional: add some border radius for aesthetics
                                width: '98%', // Ensure it matches the input width
                            }}
                            >
                            {suggestions.map((product, index) => (
                                <li
                                key={index}
                                onClick={() => onSelectProduct(product)}
                                style={{
                                    padding: '10px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #eee',
                                }}
                                >
                                <strong>{product.itemName}</strong> <br />
                                Stock: {product.stock}
                                </li>
                            ))}
                            </ul>
                        )}
                    </div>
            </div>

            <div className="row justify-content-between mx-2 mt-3">
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table className="table transparent-table custom-border-table text-center fw-semibold" >
                    <thead className="custom-header-color" style={{position: "sticky", top: 0, backgroundColor: "#E8E7EC"}}>
                        <tr>
                            <th className="text-start col-4">Product</th>
                            <th className="col-3">Price</th>
                            <th className="col-1"></th>
                            <th className="col-1">Quantity</th>
                            <th className="col-1">Total</th>
                            <th className="col-1"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderItems.map((item, idx) => (
                            
                            <tr key={idx}>
                                <td className="text-start">
                                    <div className="d-flex align-items-center gap-3">
                                        <img src={defaultPic} alt="Product" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />
                                        <div className="d-flex flex-column">
                                        <span className="fw-semibold">{item.itemName}</span>
                                        <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: item.stock < 5 ? "#B64345" : item.stock >= 5 && item.stock < 10 ? "#F8B13D" : "#ACACAC" }}>
                                            In stock: {item.stock} pcs
                                        </span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                <select
                                className="form-select mx-auto d-block w-50"
                                value={item.selectedMarkup}
                                onChange={(e) => onPriceChange(idx, e.target.value)}
                                >
                                    <option value="original">₱{item.price.original.toFixed(2)}</option>
                                    <option value="markup1">₱{item.price.markup1.toFixed(2)}</option>
                                    <option value="markup2">₱{item.price.markup2.toFixed(2)}</option>
                                </select>
                                </td>
                                <td style={{ color: "#ACACAC" }}> X </td>
                                <td className="col-1">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        min="1"
                                        max={item.stock}
                                        onChange={(e) => onUpdateOrderItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                                        className="form-control mx-auto d-block w-75 text-center"
                                    />
                                </td>
                                <td>
                                    <span>₱</span>
                                    <span>{onCalculateTotal(item).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </td>
                                <td>
                                    <div className='d-flex gap-2'>
                                    <button type="button" className="btn btn-secondary btn-sm">Reserve</button>
                                    <button type="button" className="btn bg-transparent btn-sm" onClick={() => onRemoveProduct(idx)}><FaTrashAlt style={{ color: "#B64345"}} size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {orderItems.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center text-muted">No items in order.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            </div>

            <div className="row mt-3 me-5 text-end">
              <p className="h4 fw-bold">  
                Total: ₱{onCalculateTotalPrice().toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
        </div>
    )
}

export default OrderForm
