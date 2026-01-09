import OrderForm from "./OrderForm";
import InfoForm from "./InfoForm";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Timer } from "lucide-react";

function CreateOrder({
  query,
  suggestions,
  orderItems,
  setOrderItems,
  onSearchChange,
  onSelectProduct,
  onPriceChange,
  onEnableCustomPrice,
  onDisableCustomPrice,
  onUpdateOrderItem,
  onCalculateTotal,
  onCalculateTotalPrice,
  onRemoveProduct,
  info,
  setInfo,
  onAddOrder,
}) {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

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

  const generateNextOrderId = async () => {
    try {
      // Fetch all orders from backend
      const res = await fetch(`${API_URL}/orders`);
      const orders = await res.json();

      if (!orders || orders.length === 0) {
        return "ORD001";
      }

      // Find the highest order number
      const latestOrder = orders
        .map((o) => o.orderId.replace("ORD", "")) // remove prefix
        .map(Number) // convert to number
        .sort((a, b) => b - a)[0]; // get the largest

      const nextNumber = (latestOrder + 1).toString().padStart(3, "0");
      return `ORD${nextNumber}`;
    } catch (err) {
      console.error("Failed to generate order ID:", err);
      return "ORD001"; // fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      Swal.fire("Error", "User not logged in.", "error");
      return;
    }

    if (!info.customerID) {
      Swal.fire("Error", "Please select a customer.", "error");
      return;
    }

    if (orderItems.length === 0) {
      Swal.fire("Error", "Please add at least one item to the order.", "error");
      return;
    }

    // Disable submit button (optional, prevent double clicks)
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;

    Swal.fire({
      title: "Creating Order",
      text: "Please wait while we process the order...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    // Prepare DTO for backend
    const orderDto = {
      cid: info.customerID,
      sales_agent: user.username,
      discount: info.discount || 0,
      items: orderItems.map((item) => ({
        item_code: item.itemCode,
        quantity: item.quantity,
        price: item.customPriceEnabled
          ? Number(item.customPrice)
          : Number(item[item.selectedMarkup]),
      })),
    };

    console.log("Order DTO to send:", orderDto);

    try {
      const response = await fetch(`${API_URL}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDto),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const createdOrder = await response.json();
      console.log("Order created successfully:", createdOrder);

      // Update UI locally
      onAddOrder(createdOrder);

      Swal.fire({
        title: "Success!",
        text: "Order has been created.",
        icon: "success",
        timer: 1500, // auto-close after 1.5 seconds
        showConfirmButton: false, // hides the OK button
      }).then(() => {
        // Navigate after Swal closes
        navigate("/");
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create order.", "error");
    } finally {
      Swal.close();
      if (submitButton) submitButton.disabled = false;
    }
  };

  const handleDeleteItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle the cancel action
  const handleCancel = () => {
    navigate("/"); // Navigate back to SalesOrder page
  };

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
                onSearchChange={onSearchChange}
                onSelectProduct={onSelectProduct}
                onPriceChange={onPriceChange}
                onEnableCustomPrice={onEnableCustomPrice}
                onDisableCustomPrice={onDisableCustomPrice}
                onUpdateOrderItem={onUpdateOrderItem}
                onCalculateTotal={onCalculateTotal}
                onCalculateTotalPrice={onCalculateTotalPrice}
                onRemoveProduct={onRemoveProduct}
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
              disabled={onCalculateTotalPrice() === 0}
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
