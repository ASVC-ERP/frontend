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
import SalesOrderDetails from "./Components/Orders/OrderDetails.jsx";
import SalesInvoice from "./Components/Invoice/SalesInvoice.jsx";
import SalesInvoices from "./Components/Invoices/Invoices.jsx"
import SalesInvoiceDetails from "./Components/Invoices/InvoiceDetails.jsx";
import ReturnSalesInvoice from "./Components/InvoiceReturns/Returns.jsx";
import Inventory from "./Components/Inventory/Inventory.jsx";
import Item from "./Components/Inventory/SpecificItem/Item.jsx";
import Suppliers from "./Components/Suppliers/Suppliers.jsx";
import CreateSupplier from "./Components/Suppliers/CreateSupplier.jsx"
import Customer from "./Components/Customer/Customer.jsx";
import Users from "./Components/Users/Users.jsx";
import ChangePassword from "./Components/Account/ChangePassword.jsx";
import SalesReport from "./Components/Reports/SalesReport.jsx";
import PurchaseReport from "./Components/Reports/PurchaseReport.jsx";
import HomePage from "./Components/Home.jsx";
import PurchasesPage from "./Components/Purchases/Purchases.jsx";
import PurchaseDetailsPage from "./Components/Purchases/PurchaseDetails.jsx";
import CreatePurchase from "./Components/Purchases/CreatePurchase.jsx";
import ReturnPurchase from "./Components/PurchaseReturns/Returns.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Unauthorized from "./Pages/Unauthorized.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { isAuthenticated, user, handleLoginSuccess, handleLogout } = useAuth();

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
         <ProtectedRoute user={user}>
          <Routes>
            <Route path="/login"              element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/unauthorized"       element={ <Unauthorized />} />
            <Route path="/"                   element={ <HomePage />} />
            <Route path="/order"              element={ <SalesOrder /> } />
            <Route path="/create-order"       element={ <CreateOrder /> } />
            <Route path="/order/:id"          element={ <SalesOrderDetails />} />
            <Route path="/invoice"            element={ <SalesInvoice /> } />
            <Route path="/products/:itemID"   element={ <Item />} />
            <Route path="/products"           element={ <Inventory /> } />
            <Route path="/suppliers"          element={ <Suppliers />} />
            <Route path="/suppliers/create"   element={ <CreateSupplier />} />
            <Route path="/customer"           element={ <Customer /> } />
            <Route path="/change-password"    element={ <ChangePassword /> } />
            <Route path="/users"              element={ <ProtectedRoute user={user} requiredRole="admin"><Users /></ProtectedRoute> } />

            <Route path="/invoices"           element={ <SalesInvoices /> } />
            <Route path="/invoices/:id"       element={ <SalesInvoiceDetails />} />
            <Route path="/invoice-return"     element={ <ReturnSalesInvoice />} />

            <Route path="/purchase"           element={ <PurchasesPage /> } />
            <Route path="/purchase/:id"       element={ <PurchaseDetailsPage />} />
            <Route path="/create-purchase"    element={ <CreatePurchase />} />
            <Route path="/purchase-return"    element={ <ReturnPurchase /> } />

            <Route path="/reports"            element={ <Navigate to="/reports/sales" replace /> } />
            <Route path="/reports/sales"      element={ <ProtectedRoute user={user} requiredRole="admin"><SalesReport /></ProtectedRoute> } />
            <Route path="/reports/purchases"  element={ <ProtectedRoute user={user} requiredRole="admin"><PurchaseReport /></ProtectedRoute> } />

          </Routes>
         </ProtectedRoute>
        </div>

        <ProfileModal user={user} />
      </div>
    </Router>
  );
}

export default App;
