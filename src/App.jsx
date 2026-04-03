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
import Inventory from "./Components/Inventory/Inventory.jsx";
import Item from "./Components/Inventory/SpecificItem/Item.jsx";
import Supplier from "./Components/Supplier/Supplier.jsx";
import SupplierInvoicesTable from "./Components/Supplier/SpecificSupplier/SupplierInvoicesTable.jsx";
import Customer from "./Components/Customer/Customer.jsx";
import HomePage from "./Components/Home.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Unauthorized from "./Pages/Unauthorized.jsx";
import { useAuth } from "./hooks/useAuth";
import { useOrders } from "./hooks/useOrders";
import { useInvoices } from "./hooks/useInvoices";
import { useCustomers } from "./hooks/useCustomers";
import { usePagination } from "./hooks/usePagination";

function App() {
  const { isAuthenticated, user, handleLoginSuccess, handleLogout } = useAuth();

  // Orders pagination
  const ordersPagination = usePagination();

  // Invoice pagination
  const invoicePagination = usePagination();

  const { invoices, fetchInvoices } = useInvoices(
    invoicePagination.page,
    invoicePagination.limit,
    invoicePagination.setTotalRows,
  );

  const { customers, fetchCustomers } = useCustomers();

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
        <div
          style={{
            width: "185px",
            backgroundColor: "#E8E7EC",
            fontFamily: "'Outfit', sans-serif",
          }}
          className="d-flex flex-column"
        >
          <Sidebar onLogout={handleLogout} />
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column p-0">
          <Routes>
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<HomePage />} />
            {/* Sales Orders */}
            <Route
              path="/order"
              element={
                <SalesOrder
                  orders={Object.values(orders)}
                  setOrders={setOrders}
                  customers={customers}
                  page={ordersPagination.page}
                  setPage={ordersPagination.setPage}
                  limit={ordersPagination.limit}
                  setLimit={ordersPagination.setLimit}
                  totalRows={ordersPagination.totalRows}
                />
              }
            />
            <Route
              path="/create-order"
              element={
                <CreateOrder
                  query={query}
                  suggestions={suggestions}
                  orderItems={orderItems}
                  setOrderItems={setOrderItems}
                  onSearchChange={handleSearchChange}
                  onSelectProduct={handleSelectProduct}
                  onPriceChange={handlePriceChange}
                  onEnableCustomPrice={handleEnableCustomPrice}
                  onDisableCustomPrice={handleDisableCustomPrice}
                  onUpdateOrderItem={updateOrderItem}
                  onCalculateTotal={calculateTotal}
                  onCalculateTotalPrice={calculateTotalPrice}
                  onRemoveProduct={handleRemoveProduct}
                  info={info}
                  setInfo={setInfo}
                  onAddOrder={handleAddOrder}
                />
              }
            />

            {/* Invoices */}
            <Route
              path="/invoice"
              element={
                <SalesInvoice />
              }
            />

            {/* Inventory */}
            <Route
              path="/products/:itemID"
              element={<Item />}
            />
            <Route
              path="/products"
              element={
                <Inventory />
              }
            />

            {/* Suppliers */}
            <Route
              path="/supplier"
              element={
                <Supplier />
              }
            />
            <Route
              path="/supplier/invoices"
              element={<SupplierInvoicesTable />}
            />

            {/* Customers */}
            <Route
              path="/customer"
              element={
                <Customer
                  customers={customers}
                  onRefreshCustomers={fetchCustomers}
                />
              }
            />
          </Routes>
        </div>

        <ProfileModal user={user} />
      </div>
    </Router>
  );
}

export default App;
