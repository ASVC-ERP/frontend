import OrderForm from "./OrderForm";
import InfoForm from "./InfoForm";
import axios from "axios";
import Swal from "sweetalert2";
import { showSuccessSwal, showErrorSwal, showWarningSwal, showLoadingSwal, } from "../../utils/swal";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./CreateOrder.css"

const MAX_ORDER_ITEMS = 16;

function CreateOrder() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
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
    setInfo({
      customerName: "",
      customerAddress: "",
      customerNumber: "",
      salesAgent: "",
      // reset other fields...
    });
    setOrderItems([]); // Reset order items array
  }, []);

  useEffect(() => {
    setInfo({
      customerName: "",
      customerAddress: "",
      customerNumber: "",
      salesAgent: "",
      discount: 0, // 👈 new field
    });
    setOrderItems([]); // Reset order items array
  }, []);

  // onAddOrder
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

  const checkDuplicateProduct = (itemName, existingItems, currentIndex = -1) => {
    const alreadyExists = existingItems.some(
      (item, idx) => idx !== currentIndex && item.itemName === itemName
    );
  
    if (alreadyExists) {
      showWarningSwal("Duplicate Product", `${itemName} is already in the order list.`)
      return true;
    }
    return false;
  };

  const handleSelectProduct = (items) => {
    if (orderItems.length >= MAX_ORDER_ITEMS) {
      showWarningSwal("Item Limit Reached",`You can only add up to ${MAX_ORDER_ITEMS} products per order.`)
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    //console.log("info: ", info);

    const user = JSON.parse(localStorage.getItem("user"));

    //console.log("user:", user);

    if (!user) {
      showErrorSwal("User not logged in.", "error");
      return;
    }

    if (!info.customerID) {
      showErrorSwal("Please select a customer.", "error")
      return;
    }

    if (orderItems.length === 0) {
      showErrorSwal("Please add at least one item to the order.", "error");
      return;
    }

    // Disable submit button (optional, prevent double clicks)
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;

    showLoadingSwal("Creating Order","Please wait while we process the order...");

    // Prepare DTO for backend
    const orderDto = {
      cid: info.customerID,
      sales_agent: user.userId,
      discount: info.discount || 0,
      items: orderItems.map((item) => ({
        item_id: item.id,
        quantity: item.quantity,
        price: item.customPriceEnabled
          ? Number(item.customPrice)
          : Number(item[item.selectedMarkup]),
      })),
    };

    //console.log("Order DTO to send:", orderDto);

    try {
      const response = await axios.post(`${API_URL}/order`, orderDto);

      const createdOrder = response.data;
      //console.log("Order created successfully:", createdOrder);

      // Update UI locally
      handleAddOrder(createdOrder)

      showSuccessSwal("Order Confirmed", "Order has been successfully placed.").then(() => { navigate("/order"); })
    } catch (err) {
      console.error(err);
      showErrorSwal("Failed to create order.", "Something went wrong. Try again or contact your administrator.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };

  const handleDeleteItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    navigate("/order"); // Navigate back to SalesOrder page
  };

  return (
    <form onSubmit={handleSubmit} className="create-page">
      <div className="create-card">
        <div className="create-header">
          <div>
            <h1>Create Order</h1>
            <p>Create a new sales order and add customer/product details.</p>
          </div>
        </div>
  
        <div className="create-section">
          <h5>Customer Information</h5>
  
          <InfoForm info={info} setInfo={setInfo} />
        </div>
  
        <div className="create-section">
          <h5>Products</h5>
  
          <OrderForm
            query={query}
            suggestions={suggestions}
            orderItems={orderItems}
            onSearchChange={handleSearchChange}
            onSelectProduct={handleSelectProduct}
            onPriceChange={handlePriceChange}
            onEnableCustomPrice={handleEnableCustomPrice}
            onDisableCustomPrice={handleDisableCustomPrice}
            onUpdateOrderItem={updateOrderItem}
            onCalculateTotal={calculateTotal}
            onCalculateTotalPrice={calculateTotalPrice}
            onRemoveProduct={handleRemoveProduct}
            onDeleteItem={handleDeleteItem}
          />
        </div>
  
        <div className="create-actions">
          <button
            type="button"
            className="btn create-secondary-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
  
          <button
            type="submit"
            className="btn create-primary-btn"
            disabled={calculateTotalPrice() === 0}
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="container-fluid mt-3">
        {/* Header */}
        <div className="row px-3 px-md-4">
          <div className="col-12">
            <p
              className="fw-bold fs-4 fs-md-2 mb-2"
              style={{ color: "#1E5A84", fontFamily: "'Outfit', sans-serif" }}
            >
              Create Order
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="row px-3 px-md-4">
          <div className="col-12">
            <div
              className="border rounded-3 p-3 bg-light"
              style={{ backgroundColor: "#E8E7EC" }}
            >
              <InfoForm info={info} setInfo={setInfo} />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="row mt-3 px-2 px-md-4">
          <div className="col-12">
            <div
              className="border rounded-3 p-3 bg-light"
              style={{ backgroundColor: "#E8E7EC" }}
            >
              <OrderForm
                query={query}
                suggestions={suggestions}
                orderItems={orderItems}
                onSearchChange={handleSearchChange}
                onSelectProduct={handleSelectProduct}
                onPriceChange={handlePriceChange}
                onEnableCustomPrice={handleEnableCustomPrice}
                onDisableCustomPrice={handleDisableCustomPrice}
                onUpdateOrderItem={updateOrderItem}
                onCalculateTotal={calculateTotal}
                onCalculateTotalPrice={calculateTotalPrice}
                onRemoveProduct={handleRemoveProduct}
                onDeleteItem={handleDeleteItem}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="row mt-3 px-3 px-md-4">
          <div className="col-12 d-flex justify-content-end gap-2 flex-wrap">
            <button
              type="button"
              className="btn"
              style={{ backgroundColor: "#B64345", color: "white" }}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              style={{ backgroundColor: "#1E5A84", color: "white" }}
              disabled={calculateTotalPrice() === 0}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default CreateOrder;
