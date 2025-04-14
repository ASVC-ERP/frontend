import React, { useState } from 'react';
import { IoIosSearch } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import defaultPic from "../assets/defaultPic.jpg"
import Swal from 'sweetalert2'

function OrderForm() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
  
    const [products] = useState([
        {
          name: 'Alternator',
          price: { original: 1500, markup1: 1650, markup2: 1800 },
          stock: 12,
        },
        {
          name: 'Brake Pads',
          price: { original: 800, markup1: 880, markup2: 960 },
          stock: 30,
        },
        {
          name: 'Brake Rotors',
          price: { original: 1200, markup1: 1320, markup2: 1440 },
          stock: 20,
        },
        {
          name: 'Clutch Kit',
          price: { original: 2500, markup1: 2750, markup2: 3000 },
          stock: 8,
        },
        {
          name: 'Control Arm',
          price: { original: 1000, markup1: 1100, markup2: 1200 },
          stock: 14,
        },
        {
          name: 'CV Axle',
          price: { original: 1300, markup1: 1430, markup2: 1560 },
          stock: 10,
        },
        {
          name: 'Drive Belt',
          price: { original: 400, markup1: 440, markup2: 480 },
          stock: 25,
        },
        {
          name: 'Engine Mount',
          price: { original: 700, markup1: 770, markup2: 840 },
          stock: 18,
        },
        {
          name: 'Exhaust Muffler',
          price: { original: 2000, markup1: 2200, markup2: 2400 },
          stock: 5,
        },
        {
          name: 'Fuel Pump',
          price: { original: 1800, markup1: 1980, markup2: 2160 },
          stock: 9,
        },
        {
          name: 'Headlight Assembly',
          price: { original: 1500, markup1: 1650, markup2: 1800 },
          stock: 6,
        },
        {
          name: 'Ignition Coil',
          price: { original: 600, markup1: 660, markup2: 720 },
          stock: 1,
        },
        {
          name: 'Oil Filter',
          price: { original: 200, markup1: 220, markup2: 240 },
          stock: 50,
        },
        {
          name: 'Oxygen Sensor',
          price: { original: 900, markup1: 990, markup2: 1080 },
          stock: 13,
        },
        {
          name: 'Power Steering Pump',
          price: { original: 1900, markup1: 2090, markup2: 2280 },
          stock: 7,
        },
        {
          name: 'Radiator',
          price: { original: 2200, markup1: 2420, markup2: 2640 },
          stock: 4,
        },
        {
          name: 'Shock Absorbers',
          price: { original: 1700, markup1: 1870, markup2: 2040 },
          stock: 11,
        },
        {
          name: 'Spark Plugs',
          price: { original: 300, markup1: 330, markup2: 360 },
          stock: 40,
        },
        {
          name: 'Starter Motor',
          price: { original: 1600, markup1: 1760, markup2: 1920 },
          stock: 6,
        },
        {
          name: 'Strut Assembly',
          price: { original: 2100, markup1: 2310, markup2: 2520 },
          stock: 5,
        },
        {
          name: 'Thermostat',
          price: { original: 500, markup1: 550, markup2: 600 },
          stock: 22,
        },
        {
          name: 'Timing Belt',
          price: { original: 1100, markup1: 1210, markup2: 1320 },
          stock: 16,
        },
        {
          name: 'Transmission Filter',
          price: { original: 900, markup1: 990, markup2: 1080 },
          stock: 17,
        },
        {
          name: 'Water Pump',
          price: { original: 1400, markup1: 1540, markup2: 1680 },
          stock: 12,
        },
        {
          name: 'Windshield Wiper Motor',
          price: { original: 1300, markup1: 1430, markup2: 1560 },
          stock: 8,
        },
      ]);
  
    const handleSearchChange = (e) => {
      const value = e.target.value;
      setQuery(value);
      if (value.length > 0) {
        const filtered = products.filter((p) =>
          p.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    };
  
    const handleSelectProduct = (product) => {
      const alreadyInOrder = orderItems.some(item => item.name === product.name);
    
      if (alreadyInOrder) {
        Swal.fire({
          icon: 'warning',
          title: 'Duplicate Product',
          text: `${product.name} is already in the order list.`,
          confirmButtonColor: '#0C1D61'
        });

        setQuery('');
        setSuggestions([]);
        return;
      }
    
      setOrderItems([
        ...orderItems,
        {
          ...product,
          selectedMarkup: 'markup1',
          quantity: 1,
        },
      ]);
      setQuery('');
      setSuggestions([]);
    };

    const handlePriceChange = (index, newMarkup) => {
        const updatedItems = [...orderItems];
        updatedItems[index].selectedMarkup = newMarkup;
        setOrderItems(updatedItems);
      };
  
    const updateOrderItem = (index, key, value) => {
      const updatedItems = [...orderItems];
      updatedItems[index][key] = value;
      setOrderItems(updatedItems);
    };
  
    const calculateTotal = (item) => {
      const unitPrice = item.price[item.selectedMarkup];
      return unitPrice * item.quantity;
    };

    const handleRemoveProduct = (indexToRemove) => {
        const updatedItems = orderItems.filter((_, index) => index !== indexToRemove);
        setOrderItems(updatedItems);
      };


    return (
        <div>
            <div className="row justify-content-between">
                <div className="position-relative w-75 ms-2">
                        <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search inventory"
                            value={query}
                            onChange={handleSearchChange}
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
                                onClick={() => handleSelectProduct(product)}
                                style={{
                                    padding: '10px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #eee',
                                }}
                                >
                                <strong>{product.name}</strong> <br />
                                Stock: {product.stock}
                                </li>
                            ))}
                            </ul>
                        )}
                    </div>
            </div>

            <div className="row justify-content-between mx-2 mt-3">
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                                        <span className="fw-semibold">{item.name}</span>
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
                                onChange={(e) => handlePriceChange(idx, e.target.value)}
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
                                        onChange={(e) => updateOrderItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                                        className="form-control mx-auto d-block w-75 text-center"
                                    />
                                </td>
                                <td>
                                    <span>₱</span>
                                    <span>{calculateTotal(item).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </td>
                                <td>
                                    <div className='d-flex gap-2'>
                                    <button type="button" className="btn btn-secondary btn-sm">Reserve</button>
                                    <button type="button" className="btn bg-transparent btn-sm" onClick={() => handleRemoveProduct(idx)}><FaTrashAlt style={{ color: "#B64345"}} size={18}/></button>
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
        </div>
    )
}

export default OrderForm
