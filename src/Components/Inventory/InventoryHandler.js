import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export const useProductHandlers = (
  items = [],
  onAddItem = () => {},
  onRefreshItems = () => {},
) => {

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

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

  const normalizeItem = (item) => ({
    itemID: item.itemID || item.id,
    itemCode: item.itemCode || item.item_code,
    itemName: item.itemName || item.item_name,
    brand: item.brand,
    origin: item.origin,
    stock: item.stock,
    price1: item.price1,
    minStock: item.minStock || item.min_stock,
    partNum: item.partNum || item.part_num,
    interNum: item.interNum || item.internal_num,
    unit: item.unit,
    model: item.model,
    cost: item.cost,
    price2: item.price2,
    price3: item.price3,
    price4: item.price4,
  });

  useEffect(() => {
    // ✅ Normalize items before filtering
    const normalizedItems = Object.values(items).map(normalizeItem);
    
    if (searchTerm.trim() !== "") {
      const filtered = normalizedItems.filter((row) =>
        Object.values(row).some((field) =>
          field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(normalizedItems);
    }
  }, [items, searchTerm]);

  // 🕒 Auto-refresh only when not searching
  useEffect(() => {
    if (searchTerm.trim() !== "") return; // ⛔ Pause refresh if searching

    const interval = setInterval(() => {
      onRefreshItems();
    }, 120000);

    return () => clearInterval(interval);
  }, [onRefreshItems, searchTerm]);

  // 🔍 Handle search input change
 const handleSearch = async (event) => {
  const value = event.target.value; // 👈 get the actual input value
  setSearchTerm(value);

  try {
    const res = await axios.get(`${API_URL}/product`, {
      params: {
        page: 1,
        limit: 50,
        search: value || undefined, // 👈 send the string to backend
      },
    });

    console.log("Search response:", res.data.data);

    const normalizedData = res.data.data.map(normalizeItem);
    setFilteredData(normalizedData);
  } catch (err) {
    console.error("Search failed", err);
  }
};



  useEffect(() => {
    const checkDuplicate = async () => {
      if (!itemCode.trim()) {
        setIsDuplicate(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/items/check-code?itemCode=${encodeURIComponent(
            itemCode
          )}`
        );
        setIsDuplicate(response.data.exists);
      } catch (error) {
        console.error("Error checking item code:", error);
      }
    };

    const delay = setTimeout(checkDuplicate, 400);
    return () => clearTimeout(delay);
  }, [itemCode]);

  const handleAddItemClick = () => {
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    setShowItemModal(false);
    // Clear form fields when closing
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
      console.log("New Item:", newItem);
      const success = await onAddItem(newItem);
      console.log("onAddItem returned:", success);

      if (success) {
        // Reset inputs only if added successfully
        setItemCode("");
        setItemName("");
        setBrand("");
        setOrigin("");
        setMinimumStock("");
        setPartNum("");
        setInterNum("");
        setUnit("Pc");
        setModel("");

        // ✅ Close modal
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
    console.log("CLICKED", row); // Log the clicked row data
    navigate("/inventory/item", { state: { row } }); // Navigate to the details page with the selected row data
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/items/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Imported!",
        text: response.data.message || "Items imported successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh items table
      onRefreshItems();
    } catch (error) {
      console.error("Error importing items:", error);
      const errMsg = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "Import failed",
        text: errMsg,
      });
    }
  };

  return {
    // Search state
    searchTerm,
    setSearchTerm,
    filteredData,
    handleSearch,
    
    // Item form state
    itemCode,
    setItemCode,
    itemName,
    setItemName,
    brand,
    setBrand,
    minimumStock,
    setMinimumStock,
    partNum,
    setPartNum,
    interNum,
    setInterNum,
    unit,
    setUnit,
    model,
    setModel,
    origin,
    setOrigin,
    isDuplicate,
    
    // Modal state
    showItemModal,
    setShowItemModal,
    
    // Handlers
    handleAddItemClick,
    handleCloseItemModal,
    handleSubmitItem,
    handleDeleteItem,
    handleRowClick,
    handleFileUpload,
  };
}