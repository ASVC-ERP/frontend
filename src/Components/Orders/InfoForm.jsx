import React, { useState, useEffect } from "react";
import axios from "axios";

function InfoForm({ info, setInfo }) {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Fetch customer list
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("/api/customers");
        setCustomers(res.data);
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
      c.customerName.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  }, [query, customers]);

  const handleSelectCustomer = (customer) => {
    setInfo({
      ...info,
      customerName: customer.customerName,
      customerNumber: customer.customerContact,
      customerAddress: customer.customerAddress,
      customerTIN: customer.customerTIN,
    });
    setQuery(customer.customerName);
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
                key={c.customerID}
                onMouseDown={() => handleSelectCustomer(c)} // <- fix for autofill
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {c.customerName} - {c.customerContact}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="col-2">
        <label htmlFor="customerNumber" className="ms-5 h6">
          Contact No:
        </label>
      </div>
      <div className="col-3">
        <input
          type="text"
          className="form-control form-control-sm"
          id="customerNumber"
          value={info.customerNumber}
          onChange={handleChange}
        />
      </div>
    </div>

    {/* Address and TIN */}
    <div className="row mx-5 mt-3 d-flex align-items-center">
      <div className="col-1">
        <label htmlFor="customerAddress" className="h6">
          Address:
        </label>
      </div>
      <div className="col-6">
        <input
          type="text"
          className="form-control form-control-sm"
          id="customerAddress"
          value={info.customerAddress}
          onChange={handleChange}
        />
      </div>
      <div className="col-2">
        <label htmlFor="customerTIN" className="ms-5 h6">
          TIN: 
        </label>
      </div>
      <div className="col-3">
        <input
          type="text"
          className="form-control form-control-sm"
          id="customerTIN"
          value={info.customerTIN}
          onChange={handleChange}
        />
      </div>
    </div>
  </div>
);

}

export default InfoForm;
