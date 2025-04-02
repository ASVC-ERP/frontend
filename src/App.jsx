import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import necessary components
import Sidebar from "./Components/Sidebar.jsx";
import SalesOrder from "./Components/SalesOrder.jsx";
import CreateOrder from "./Components/CreateOrder.jsx"; // Assuming CreateOrder is the new page
import "./App.css";

function App() {
  return (
    <Router> {/* Wrap the entire app with Router */}
      <div className="container-fluid vh-100">
        <div className="row h-100">
          <div
            className="col-2 overflow-hidden d-flex flex-column"
            style={{ backgroundColor: "#E8E7EC", fontFamily: "'Outfit', sans-serif" }}
          >
            <Sidebar />
          </div>
          <div className="col-10 d-flex flex-column p-0">
            {/* Define routes here */}
            <Routes>
              <Route path="/" element={<SalesOrder />} />
              <Route path="/create-order" element={<CreateOrder />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
