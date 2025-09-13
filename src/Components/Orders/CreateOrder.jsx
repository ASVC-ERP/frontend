import OrderForm from "./OrderForm";
import InfoForm from "./InfoForm";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function CreateOrder({
  query,
  suggestions,
  orderItems,
  setOrderItems,
  onSearchChange,
  onSelectProduct,
  onPriceChange,
  onUpdateOrderItem,
  onCalculateTotal,
  onCalculateTotalPrice,
  onRemoveProduct,
  info,
  setInfo,
  onAddOrder,
}) {
  const navigate = useNavigate();

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

  /*
    const handleSubmit = (e) => {
        e.preventDefault();

        // const totalPrice = onCalculateTotalPrice();

        const orderId = `ORD${(Math.floor(Math.random() * 1000)).toString().padStart(3, "0")}`;

        const newOrder = {
            orderId,
            date: new Date().toISOString().split("T")[0],
            ...info,
            orderItems,
            totalPrice: orderItems.reduce((sum, item) => sum + item.price[item.selectedMarkup] * item.quantity, 0),
            status: "Pending"
          };

        console.log("Final Order Data:", newOrder);
        // you can send it to the backend here

        onAddOrder(newOrder); // will use orderId as key
        navigate("/");
    };
    */
  const generateNextOrderId = async () => {
    try {
      // Fetch all orders from backend
      const res = await fetch("http://localhost:3000/orders");
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
    const user = JSON.parse(localStorage.getItem("user"));
    const fullName = `${user.firstName} ${user.lastName}`;
    e.preventDefault();

    const orderId = await generateNextOrderId();

    const newOrder = {
      orderId,
      date: new Date().toISOString().split("T")[0],
      ...info,
      orderedItems: orderItems.map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price?.[item.selectedMarkup], // Use selected price
      })),
      totalPrice: orderItems.reduce(
        (sum, item) => sum + item.price?.[item.selectedMarkup] * item.quantity,
        0
      ),
      status: "Pending",
      salesAgent: fullName,
    };

    console.log("Final Order Data:", newOrder);
    // Show the final JSON string in console
    const finalJson = JSON.stringify(newOrder, null, 2); // pretty-print
    console.log("JSON to be POSTed:\n", finalJson);

    try {
      const response = await fetch("http://localhost:3000/orders", {
        // <-- your backend endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const createdOrder = await response.json();
      console.log("Order created successfully:", createdOrder);

      // Optionally call local handler to update UI
      onAddOrder(createdOrder);

      Swal.fire("Success!", "Order has been created.", "success");

      navigate("/"); // Go back to order list
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create order.", "error");
    }
  };

  // Handle the cancel action
  const handleCancel = () => {
    navigate("/"); // Navigate back to SalesOrder page
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="container-fluid mt-3">
        {/* Header */}
        <div className="row mx-2">
          <div className="col-12">
            <p
              className="h3 h1-md fw-bold mb-2"
              style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}
            >
              Create Order
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="row mt-3 mx-2">
          <div className="col-12">
            <div
              className="border rounded-3 p-3"
              style={{ backgroundColor: "#E8E7EC" }}
            >
              <p
                className="h5 fw-bold mb-3"
                style={{ color: "#050505", fontFamily: "'Outfit', sans-serif" }}
              >
                Customer Info
              </p>
              <InfoForm info={info} setInfo={setInfo} />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="row mt-3 mx-2">
          <div className="col-12">
            <div
              className="border rounded-3 p-3"
              style={{ backgroundColor: "#E8E7EC" }}
            >
              <p
                className="h5 fw-bold mb-3"
                style={{ color: "#050505", fontFamily: "'Outfit', sans-serif" }}
              >
                Product Details
              </p>
              <OrderForm
                query={query}
                suggestions={suggestions}
                orderItems={orderItems}
                onSearchChange={onSearchChange}
                onSelectProduct={onSelectProduct}
                onPriceChange={onPriceChange}
                onUpdateOrderItem={onUpdateOrderItem}
                onCalculateTotal={onCalculateTotal}
                onCalculateTotalPrice={onCalculateTotalPrice}
                onRemoveProduct={onRemoveProduct}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="row mt-3 mx-2">
          <div className="col-12 d-flex justify-content-end">
            <button
              type="button"
              className="btn me-2"
              style={{ backgroundColor: "#B64345", color: "white" }}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              style={{ backgroundColor: "#0C1D61", color: "white" }}
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
