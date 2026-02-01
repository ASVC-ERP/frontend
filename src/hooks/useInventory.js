import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const transformItem = (item) => ({
  itemID: item.id,
  itemCode: item.item_code,
  itemName: item.item_name,
  brand: item.brand,
  origin: item.origin,
  stock: item.stock,
  price1: item.price1,
  price2: item.price2,
  price3: item.price3,
  price4: item.price4,
  minStock: item.min_stock,
  cost: item.cost,
  partNum: item.part_num,
  interNum: item.internal_num,
  unit: item.unit,
  model: item.model,
});

export const useInventory = (page, limit, setTotalRows) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, [page, limit]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/product`, {
        params: { page, limit },
      });

      const transformedItems = response.data.data.map(transformItem);
      setItems(transformedItems);
      setTotalRows(response.data.meta.total);
    } catch (error) {
      console.error("Error fetching items from backend:", error);
    }
  };

  const handleAddItem = async (newItem) => {
    Swal.fire({
      title: "Adding Item",
      text: "Please wait while we add the new item...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await axios.post(`${API_URL}/product`, newItem);
      
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Item added successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchItems();
      return true;
    } catch (err) {
      Swal.close();

      if (err.response?.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Item",
          text: err.response.data.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again later.",
        });
      }

      return false;
    }
  };

  return {
    items,
    fetchItems,
    handleAddItem,
  };
};