import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { debug } from "../../utils/log";

export const useProductHandlers = (
  onRefreshItems = () => {},
) => {

  const navigate = useNavigate();

  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [brand, setBrand] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [partNum, setPartNum] = useState("");
  const [interNum, setInterNum] = useState("");
  const [unit, setUnit] = useState("Pc");
  const [model, setModel] = useState("");
  const [origin, setOrigin] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);

  const [showItemModal, setShowItemModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Auto-refresh 2 minutes
  /*
  useEffect(() => {
    const interval = setInterval(() => { onRefreshItems(); }, 120000);
    return () => clearInterval(interval);
  }, [onRefreshItems]);
  */
 
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!itemCode.trim()) {
        setIsDuplicate(false);
        return;
      }
      try { 
        const response = await axios.get(`${API_URL}/product/check-code/${encodeURIComponent( itemCode )}` );
        setIsDuplicate(response.data.exists);
      } catch (error) { console.error("Error checking item code:", error); }
    };
    const delay = setTimeout(checkDuplicate, 400);
    return () => clearTimeout(delay);
  }, [itemCode]);

  const handleAddItemClick = () => { 
    debug("add")
    setShowItemModal(true); 
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
      const res = await axios.post(`${API_URL}/product`, newItem);
      
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Item added successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      onRefreshItems();
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

  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setItemCode("");
    setItemName("");
    setBrand("");
    setOrigin("");
    setMinimumStock("");
    setPartNum("");
    setInterNum("");
    setUnit("Pc");
    setModel("");
  };

  const handleSubmitItem = async () => {
    if (!itemCode || !itemName) return;

    const trimmedItem = {
      item_code: itemCode.trim(),
      item_name: itemName.trim(),
      brand: brand.trim(),
      origin: origin.trim(),
      min_stock: minimumStock || 0,
      part_num: partNum.trim(),
      internal_num: interNum.trim(),
      unit: unit.trim(),
      model: model.trim(),
    };

    if (
      !trimmedItem.item_code ||
      !trimmedItem.item_name ||
      !trimmedItem.brand ||
      !trimmedItem.origin ||
      trimmedItem.min_stock === null ||
      trimmedItem.min_stock === undefined ||
      !trimmedItem.part_num ||
      !trimmedItem.internal_num ||
      !trimmedItem.unit ||
      !trimmedItem.model
    ) {
      Swal.fire({
        text: "Please fill in all item details.",
        icon: "warning",
        confirmButtonColor: "#1E5A84",
      });
      return;
    }

    const newItem = {
      ...trimmedItem,
      min_stock: Number(trimmedItem.min_stock),
      stock: Number(0),
      cost: Number(0),
      price1: Number(0),
      price2: Number(0),
      price3: Number(0),
      price4: Number(0),
    };

    try {
      debug("New Item:", newItem);
      const success = await handleAddItem(newItem);
      debug("onAddItem returned:", success);

      if (success) {
        handleCloseItemModal();
      } else {
        Swal.fire({
          text: "Failed to add item. Item code already exist.",
          icon: "error",
          confirmButtonColor: "#1E5A84",
        });
      }
    } catch (error) {
      console.error("Error adding item:", error);
      Swal.fire({
        text: "An error occurred while adding the item.",
        icon: "error",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This item will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleting Item",
          text: "Please wait while we delete the item...",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        
        await axios.delete(`${API_URL}/product/${id}`);

        Swal.fire({
          title: "Deleted!",
          text: "Item has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#1E5A84",
        });

        onRefreshItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to delete item.",
        icon: "error",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  const handleRowClick = (row) => {
    debug("CLICKED", row);
    navigate(`/products/${row.itemID}`, { state: { row } });
  };

  return {
    itemCode, setItemCode,
    itemName, setItemName,
    brand, setBrand,
    minimumStock, setMinimumStock,
    partNum, setPartNum,
    interNum, setInterNum,
    unit, setUnit,
    model, setModel,
    origin, setOrigin,
    isDuplicate,
    
    showItemModal, setShowItemModal,
    
    handleAddItemClick,
    handleCloseItemModal,
    handleSubmitItem,
    handleDeleteItem,
    handleRowClick,
  };
}