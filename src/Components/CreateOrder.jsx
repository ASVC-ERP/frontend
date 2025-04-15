import Sidebar from "./Sidebar"
import OrderForm from "./OrderForm"
import InfoForm from "./InfoForm"
import Swal from 'sweetalert2'
import { useNavigate } from "react-router-dom"
import { useEffect } from "react";

function CreateOrder({query, suggestions, orderItems, setOrderItems, onSearchChange, onSelectProduct, onPriceChange, onUpdateOrderItem, onCalculateTotal, onCalculateTotalPrice, onRemoveProduct, info, setInfo, onAddOrder}) {

    const navigate = useNavigate();

    useEffect(() => {
        setInfo({
            customerName: "",
            customerAddress: "",
            customerNumber: "",
            salesAgent: "Prince 兄",
            // reset other fields...
        });
        setOrderItems([]);  // Reset order items array
    }, []);

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

    // Handle the cancel action
    const handleCancel = () => {
        navigate("/");  // Navigate back to SalesOrder page
    };

    return (
        <form onSubmit={handleSubmit}>
        <div className="container mt-3">
            <div className="d-flex justify-content-between align-items-center">
                <p className="h1 fw-bold mb-0 ms-3" style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}>Create Order</p>
            </div>

            <div className="row mt-3 mx-3">
                <div className="border rounded-3" style={{height:"150px", backgroundColor: "#E8E7EC"}}>
                    <p className="h4 fw-bold mt-2 ms-3" style={{ color: "#050505", fontFamily: "'Outfit', sans-serif" }}>Customer Info</p>
                    <InfoForm info={info} setInfo={setInfo} />
                </div>
            </div>

            <div className="row mt-3 mx-3">
                <div className="border rounded-3" style={{height:"400px", backgroundColor: "#E8E7EC"}}>
                    <p className="h4 fw-bold mt-2 ms-3" style={{ color: "#050505", fontFamily: "'Outfit', sans-serif" }}>Product Details</p>
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
                        onRemoveProduct={onRemoveProduct} />
                </div>
            </div>

            

            <div className="mt-2 d-flex justify-content-end align-items-center">
                <button 
                    type="button"
                    className="btn me-4"
                    style={{ backgroundColor: "#B64345", color: "white" }}
                    onClick={handleCancel}  // Trigger navigation to SalesOrder page
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn me-5"
                    style={{ backgroundColor: "#0C1D61", color: "white" }}
                    disabled={onCalculateTotalPrice() === 0}
                >
                    Submit
                </button>
            </div>
            </div>
        </form>
      );
    }
    
export default CreateOrder;
