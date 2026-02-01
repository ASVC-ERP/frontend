import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { checkDuplicateProduct } from "./useOrderHelpers";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_ORDER_ITEMS = 16;

export const useOrders = (page, limit, setTotalRows) => {
  const [orders, setOrders] = useState({});
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [info, setInfo] = useState({
    customerID: "",
    customerName: "",
    customerNumber: "",
    customerAddress: "",
    salesAgent: "",
    discount: 0,
    delivery: "1",
  });

  useEffect(() => {
    fetchOrders();
  }, [page, limit]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/order`, {
        params: { page, limit },
      });
      setOrders(res.data.data);
      setTotalRows(res.data.meta.total);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const handleAddOrder = (newOrder) => {
    setOrders((prevOrders) => ({
      ...prevOrders,
      [newOrder.orderId]: newOrder,
    }));
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/product/search`,
        {
          params: {
            q: value,     // 👈 matches @Query('q')
            limit: 20,    // 👈 optional, matches @Query('limit')
          },
        }
      );

      const itemList = res.data.map((item) => ({
        ...item,
        itemCode: item.item_code,
        itemName: item.item_name,
        stock: item.stock,
      }));

      setSuggestions(itemList);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setSuggestions([]);
    }
  };

  const handleSelectProduct = (items) => {
    if (orderItems.length >= MAX_ORDER_ITEMS) {
      Swal.fire({
        icon: "warning",
        iconColor: "#950606",
        title: "Item Limit Reached",
        text: `You can only add up to ${MAX_ORDER_ITEMS} products per order.`,
        confirmButtonColor: "#1E5A84",
      });
      setQuery("");
      setSuggestions([]);
      return;
    }

    if (checkDuplicateProduct(items.itemName, orderItems)) {
      setQuery("");
      setSuggestions([]);
      return;
    }

    setOrderItems([
      ...orderItems,
      {
        ...items,
        selectedMarkup: "price1",
        quantity: 1,
      },
    ]);
    setQuery("");
    setSuggestions([]);
  };

  const handlePriceChange = (index, selectedPriceColumn, isCustom = false) => {
    const updatedItems = [...orderItems];

    if (isCustom) {
      updatedItems[index].customPrice = selectedPriceColumn;
    } else {
      updatedItems[index].selectedMarkup = selectedPriceColumn;
      updatedItems[index].customPriceEnabled = false;
    }

    setOrderItems(updatedItems);
  };

  const handleEnableCustomPrice = (index) => {
    const updatedItems = [...orderItems];
    updatedItems[index].customPriceEnabled = true;
    updatedItems[index].customPrice = "";
    setOrderItems(updatedItems);
  };

  const handleDisableCustomPrice = (index) => {
    const updated = [...orderItems];
    updated[index].customPriceEnabled = false;
    updated[index].customPrice = "";
    setOrderItems(updated);
  };

  const updateOrderItem = (index, key, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index][key] = value;
    setOrderItems(updatedItems);
  };

  const calculateTotal = (item) => {
    const unitPrice = item.customPriceEnabled
      ? parseFloat(item.customPrice) || 0
      : parseFloat(item[item.selectedMarkup]) || 0;

    const quantity = parseInt(item.quantity) || 0;
    return unitPrice * quantity;
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      const unitPrice = item.customPriceEnabled
        ? parseFloat(item.customPrice) || 0
        : parseFloat(item[item.selectedMarkup]) || 0;

      const quantity = parseInt(item.quantity) || 0;
      return total + unitPrice * quantity;
    }, 0);
  };

  const handleRemoveProduct = (indexToRemove) => {
    const updatedItems = orderItems.filter(
      (_, index) => index !== indexToRemove
    );
    setOrderItems(updatedItems);
  };

  return {
    orders,
    setOrders,
    info,
    setInfo,
    query,
    suggestions,
    orderItems,
    setOrderItems,
    handleAddOrder,
    handleSearchChange,
    handleSelectProduct,
    handlePriceChange,
    handleEnableCustomPrice,
    handleDisableCustomPrice,
    updateOrderItem,
    calculateTotal,
    calculateTotalPrice,
    handleRemoveProduct,
    checkDuplicateProduct,
  };
};