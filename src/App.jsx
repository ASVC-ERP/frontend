import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";
import Sidebar from "./Components/Sidebar.jsx";
import ProfileModal from "./Components/ProfileModal";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import ErrorBoundary from "./Components/ErrorBoundary.jsx";
import PageLoader from "./Components/PageLoader.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Unauthorized from "./Pages/Unauthorized.jsx";
import { useAuth } from "./hooks/useAuth";

// Route screens are code-split: each loads its own JS chunk on first visit,
// so the initial bundle stays small.
const HomePage = lazy(() => import("./Components/Home.jsx"));
const SalesOrder = lazy(() => import("./Components/Orders/SalesOrder.jsx"));
const CreateOrder = lazy(() => import("./Components/Orders/CreateOrder.jsx"));
const SalesOrderDetails = lazy(() => import("./Components/Orders/OrderDetails.jsx"));
const SalesInvoice = lazy(() => import("./Components/Invoice/SalesInvoice.jsx"));
const SalesInvoices = lazy(() => import("./Components/Invoices/Invoices.jsx"));
const SalesInvoiceDetails = lazy(() => import("./Components/Invoices/InvoiceDetails.jsx"));
const ReturnSalesInvoice = lazy(() => import("./Components/InvoiceReturns/Returns.jsx"));
const Inventory = lazy(() => import("./Components/Inventory/Inventory.jsx"));
const Item = lazy(() => import("./Components/Inventory/SpecificItem/Item.jsx"));
const Suppliers = lazy(() => import("./Components/Suppliers/Suppliers.jsx"));
const CreateSupplier = lazy(() => import("./Components/Suppliers/CreateSupplier.jsx"));
const Customer = lazy(() => import("./Components/Customer/Customer.jsx"));
const Users = lazy(() => import("./Components/Users/Users.jsx"));
const ChangePassword = lazy(() => import("./Components/Account/ChangePassword.jsx"));
const SalesReport = lazy(() => import("./Components/Reports/SalesReport.jsx"));
const PurchaseReport = lazy(() => import("./Components/Reports/PurchaseReport.jsx"));
const ReportListPage = lazy(() => import("./Components/Reports/ReportListPage.jsx"));
const PurchasesPage = lazy(() => import("./Components/Purchases/Purchases.jsx"));
const PurchaseDetailsPage = lazy(() => import("./Components/Purchases/PurchaseDetails.jsx"));
const CreatePurchase = lazy(() => import("./Components/Purchases/CreatePurchase.jsx"));
const ReturnPurchase = lazy(() => import("./Components/PurchaseReturns/Returns.jsx"));

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
          <Sidebar user={user} onLogout={handleLogout} />
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column p-0">
         <ProtectedRoute user={user}>
          <ErrorBoundary>
           <Suspense fallback={<PageLoader />}>
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

              <Route path="/reports"                 element={ <Navigate to="/reports/sales" replace /> } />
              <Route path="/reports/sales"           element={ <ProtectedRoute user={user} requiredRole="admin"><SalesReport /></ProtectedRoute> } />
              <Route path="/reports/purchases"       element={ <ProtectedRoute user={user} requiredRole="admin"><PurchaseReport /></ProtectedRoute> } />
              <Route path="/reports/sales/:panel"     element={ <ProtectedRoute user={user} requiredRole="admin"><ReportListPage /></ProtectedRoute> } />
              <Route path="/reports/purchases/:panel" element={ <ProtectedRoute user={user} requiredRole="admin"><ReportListPage /></ProtectedRoute> } />

            </Routes>
           </Suspense>
          </ErrorBoundary>
         </ProtectedRoute>
        </div>

        <ProfileModal user={user} />
      </div>
    </Router>
  );
}

export default App;
