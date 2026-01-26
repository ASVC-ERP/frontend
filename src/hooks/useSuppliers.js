import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const transformSupplier = (supplier) => ({
  id: supplier.id,
  sid: supplier.sid,
  name: supplier.name,
  address: supplier.address,
  currency: supplier.currency,
  number: supplier.number,
});

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_URL}/supplier`);
      const transformedSuppliers = response.data.map(transformSupplier);
      setSuppliers(transformedSuppliers);
    } catch (error) {
      console.error("Error fetching suppliers from backend:", error);
    }
  };

  const handleAddSupplier = async (newSupplier) => {
    Swal.fire({
      title: "Adding Supplier",
      text: "Please wait while we add a new supplier...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.post(`${API_URL}/supplier`, newSupplier);
      
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Supplier added!",
        text: response.data.message || "Supplier added successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      
      fetchSuppliers();
    } catch (err) {
      Swal.close();

      if (err.response) {
        if (err.response.status === 409) {
          Swal.fire({
            icon: "error",
            title: "Duplicate Supplier",
            text: err.response.data.message || "This supplier already exists.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err.response.data.message || "Something went wrong. Please try again later.",
          });
        }
      } else if (err.request) {
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Unable to reach the server. Please check your connection.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Unexpected Error",
          text: err.message,
        });
      }
    }
  };

  return {
    suppliers,
    fetchSuppliers,
    handleAddSupplier,
  };
};