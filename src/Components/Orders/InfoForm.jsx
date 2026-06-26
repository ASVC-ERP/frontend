import React, { useState, useEffect } from "react";
import axios from "axios";
import"../../styles/lookup.css"

function InfoForm({ info, setInfo }) {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${API_URL}/customer`, {
          params: { limit: 500 },
        });
        setCustomers(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    };

    fetchCustomers();
  }, [API_URL]);

  useEffect(() => {
    setQuery(info.customerName || "");
  }, [info.customerName]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = customers.filter((c) =>
      c.name?.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered);
  }, [query, customers]);

  const handleSelectCustomer = (customer) => {
    setInfo((prev) => ({
      ...prev,
      customerID: customer.id,
      customerName: customer.name,
      customerNumber: customer.number,
      customerAddress: customer.address,
      customerTIN: customer.tin,
    }));

    setQuery(customer.name);
    setSuggestions([]);
  };

  const handleChange = (e) => {
    const value = e.target.value;

    setQuery(value);

    setInfo((prev) => ({
      ...prev,
      customerName: value,
      customerID: "",
      customerNumber: "",
      customerAddress: "",
      customerTIN: "",
    }));
  };

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label">Customer Name</label>
  
        <div className="customer-search">
          <input
            type="text"
            className="form-control"
            value={query}
            onChange={handleChange}
            onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            placeholder="Search customer..."
          />
  
          {suggestions.length > 0 && (
            <ul className="customer-suggestions">
              {suggestions.map((customer) => (
                <li
                  key={customer.id}
                  onMouseDown={() => handleSelectCustomer(customer)}
                >
                  <strong>{customer.name}</strong>
                  <span>{customer.number}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
  
      <div className="col-md-6">
        <label className="form-label">Contact Number</label>
        <input
          type="text"
          className="form-control"
          value={info.customerNumber || ""}
          disabled
        />
      </div>
  
      <div className="col-md-8">
        <label className="form-label">Address</label>
        <input
          type="text"
          className="form-control"
          value={info.customerAddress || ""}
          disabled
        />
      </div>
  
      <div className="col-md-4">
        <label className="form-label">TIN</label>
        <input
          type="text"
          className="form-control"
          value={info.customerTIN || ""}
          disabled
        />
      </div>
    </div>
  );
  
  return (
    <div className="row g-3">
      <div className="col-md-4">
        <label className="form-label">Customer Name</label>

        <div className="customer-search">
          <input
            type="text"
            className="form-control"
            value={query}
            onChange={handleChange}
            onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            placeholder="Search customer..."
          />

          {suggestions.length > 0 && (
            <ul className="customer-suggestions">
              {suggestions.map((customer) => (
                <li
                  key={customer.id}
                  onMouseDown={() => handleSelectCustomer(customer)}
                >
                  <strong>{customer.name}</strong>
                  <span>{customer.number}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="col-md-3">
        <label className="form-label">Contact Number</label>
        <input
          className="form-control"
          value={info.customerNumber || ""}
          disabled
        />
      </div>

      <div className="col-md-3">
        <label className="form-label">TIN</label>
        <input
          className="form-control"
          value={info.customerTIN || ""}
          disabled
        />
      </div>

      <div className="col-md-12">
        <label className="form-label">Address</label>
        <input
          className="form-control"
          value={info.customerAddress || ""}
          disabled
        />
      </div>
    </div>
  );
}

export default InfoForm;