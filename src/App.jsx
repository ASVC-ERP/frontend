import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";
import Sidebar from "./Components/Sidebar.jsx";
import ProfileModal from "./Components/ProfileModal";
import SalesOrder from "./Components/Orders/SalesOrder.jsx";
import CreateOrder from "./Components/Orders/CreateOrder.jsx";
import SalesInvoice from "./Components/Invoice/SalesInvoice.jsx";
import SalesInvoices from "./Components/Invoices/Invoices.jsx"
import Inventory from "./Components/Inventory/Inventory.jsx";
import Item from "./Components/Inventory/SpecificItem/Item.jsx";
import Suppliers from "./Components/Suppliers/Suppliers.jsx";
import CreateSupplier from "./Components/Suppliers/CreateSupplier.jsx"
import Customer from "./Components/Customer/Customer.jsx";
import HomePage from "./Components/Home.jsx";
import PurchasesPage from "./Components/Purchases/Purchases.jsx";
import PurchaseDetailsPage from "./Components/Purchases/PurchaseDetails.jsx";
import CreatePurchase from "./Components/Purchases/CreatePurchase.jsx";
import ReturnPurchase from "./Components/PurchaseReturns/Returns.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Unauthorized from "./Pages/Unauthorized.jsx";
import { useAuth } from "./hooks/useAuth";
import { useOrders } from "./hooks/useOrders";
import { usePagination } from "./hooks/usePagination";

function App() {
  const { isAuthenticated, user, handleLoginSuccess, handleLogout } = useAuth();

  // Orders pagination
  const ordersPagination = usePagination();

  const {
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
  } = useOrders(
    ordersPagination.page,
    ordersPagination.limit,
    ordersPagination.setTotalRows,
  );

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="container-fluid vh-100 d-flex p-0">
        {/* Sidebar */}
        <div className="d-flex flex-column" >
          <Sidebar onLogout={handleLogout} />
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column p-0">
          <Routes>
            <Route path="/unauthorized"       element={ <Unauthorized />} />
            <Route path="/"                   element={ <HomePage />} />
            <Route path="/order"              element={ <SalesOrder /> } />
            <Route path="/create-order"       element={ <CreateOrder /> } />
            <Route path="/invoice"            element={ <SalesInvoice /> } />
            <Route path="/products/:itemID"   element={ <Item />} />
            <Route path="/products"           element={ <Inventory /> } />
            <Route path="/suppliers"          element={ <Suppliers />} />
            <Route path="/suppliers/create"   element={ <CreateSupplier />} />
            <Route path="/customer"           element={ <Customer /> } />

            <Route path="/sales-invoice"      element={ <SalesInvoices /> } />

            <Route path="/purchase"           element={ <PurchasesPage /> } />
            <Route path="/purchase/:id"       element={ <PurchaseDetailsPage />} />
            <Route path="/create-purchase"    element={ <CreatePurchase />} />
            <Route path="/purchase-return"    element={ <ReturnPurchase /> } />

          </Routes>
        </div>

        <ProfileModal user={user} />
      </div>
    </Router>
  );
}

export default App;
