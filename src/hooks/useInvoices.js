import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const useInvoices = (page, limit, setTotalRows) => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, [page, limit]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_URL}/invoice`, {
        params: { page, limit },
      });
      setInvoices(response.data.data);
      setTotalRows(response.data.meta.total);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  return {
    invoices,
    fetchInvoices,
  };
};
