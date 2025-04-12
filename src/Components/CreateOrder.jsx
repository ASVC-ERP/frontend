import Sidebar from "./Sidebar"
import OrderForm from "./OrderForm"
import InfoForm from "./InfoForm"
import { useNavigate } from "react-router-dom";  // Import useNavigate


function CreateOrder() {
    const navigate = useNavigate();  // Initialize navigate function

    // Handle the cancel action
    const handleCancel = () => {
        navigate("/");  // Navigate back to SalesOrder page
    };

    return (
        <div className="container mt-3">
            <div className="d-flex justify-content-between align-items-center">
                <p className="h1 fw-bold mb-0 ms-3" style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}>Create Order</p>
            </div>

            <div className="row mt-3 mx-3">
                <div className="border rounded-3" style={{height:"150px", backgroundColor: "#E8E7EC"}}>
                    <p className="h4 fw-bold mt-2 ms-3" style={{ color: "#050505", fontFamily: "'Outfit', sans-serif" }}>Customer Info</p>
                    <InfoForm />
                </div>
            </div>

            <div className="row mt-3 mx-3">
                <div className="border rounded-3" style={{height:"400px", backgroundColor: "#E8E7EC"}}>
                    <p className="h4 fw-bold mt-2 ms-3" style={{ color: "#050505", fontFamily: "'Outfit', sans-serif" }}>Product Details</p>
                    <OrderForm />
                </div>
            </div>

            

            <div className="mt-4 d-flex justify-content-end align-items-center">
                <button 
                    type="button"
                    className="btn me-4"
                    style={{ backgroundColor: "#B64345", color: "white" }}
                    onClick={handleCancel}  // Trigger navigation to SalesOrder page
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn me-5"
                    style={{ backgroundColor: "#0C1D61", color: "white" }}
                >
                    Submit
                </button>
            </div>
            
        </div>
      );
    }
    
export default CreateOrder;
