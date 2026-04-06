import React, { useState, useEffect } from "react";
import axios from "axios";

function InfoForm({ info, setInfo }) {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch customer list
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // TODO: need to change when customers goes beyond 500
        const res = await axios.get(`${API_URL}/customer`, { params: { limit: 500 } } );
        setCustomers(res.data.data);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  // Sync query with info.customerName (pre-fill)
  useEffect(() => {
    setQuery(info.customerName || "");
  }, [info.customerName]);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filtered = customers.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  }, [query, customers]);

  const handleSelectCustomer = (customer) => {
    setInfo({
      ...info,
      customerID: customer.id,
      customerName: customer.name,
      customerNumber: customer.number,
      customerAddress: customer.address,
      customerTIN: customer.tin,
      //customerTerms: customer.customerTerms,
    });
    setQuery(customer.name);
    setSuggestions([]);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (id === "customerName") setQuery(value);
  };

  return (
    <div>
      {/* Customer Name / Dropdown */}
      <div className="row mx-5 d-flex align-items-center">
        <div className="col-1">
          <label className="h6">Customer: </label>
        </div>
        <div className="col-6 position-relative">
          <input
            type="text"
            className="form-control form-control-sm"
            id="customerName"
            value={query}
            onChange={handleChange}
            onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            placeholder="Search customer..."
          />
          {suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "38px",
                left: 0,
                right: 0,
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                listStyleType: "none",
                margin: 0,
                padding: 0,
                maxHeight: "150px",
                overflowY: "auto",
                zIndex: 1000,
              }}
            >
              {suggestions.map((c) => (
                <li
                  key={c.cid}
                  onMouseDown={() => handleSelectCustomer(c)}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {c.name} - {c.number}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default InfoForm;
