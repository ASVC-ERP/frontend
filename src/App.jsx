import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";

import "./App.css";
import Sidebar from "./Components/Sidebar.jsx";
import ProfileModal from "./Components/ProfileModal";
import Approval from "./Components/Approval/Approval.jsx";
import SalesOrder from "./Components/Orders/SalesOrder.jsx";
import CreateOrder from "./Components/Orders/CreateOrder.jsx";
import SalesInvoice from "./Components/Invoice/SalesInvoice.jsx";
import Inventory from "./Components/Inventory/Inventory.jsx";
import Item from "./Components/Inventory/SpecificItem/Item.jsx";
import Supplier from "./Components/Supplier/Supplier.jsx";
import SupplierInvoicesTable from "./Components/Supplier/SpecificSupplier/SupplierInvoicesTable.jsx";
import Customer from "./Components/Customer/Customer.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import Unauthorized from "./Pages/Unauthorized.jsx";

import { useAuth } from "./hooks/useAuth";
import { useOrders } from "./hooks/useOrders";
import { useInvoices } from "./hooks/useInvoices";
import { useInventory } from "./hooks/useInventory";
import { useSuppliers } from "./hooks/useSuppliers";
import { useCustomers } from "./hooks/useCustomers";
import { usePagination } from "./hooks/usePagination";

function App() {
  const { isAuthenticated, user, handleLoginSuccess, handleLogout } = useAuth();

  // Orders pagination
  const ordersPagination = usePagination();

  // Inventory pagination
  const inventoryPagination = usePagination();

  // Invoice pagination
  const invoicePagination = usePagination();

  const { invoices, fetchInvoices } = useInvoices(
    invoicePagination.page,
    invoicePagination.limit,
    invoicePagination.setTotalRows,
  );

  const { items, fetchItems, handleAddItem } = useInventory(
    inventoryPagination.page,
    inventoryPagination.limit,
    inventoryPagination.setTotalRows,
  );

  const { suppliers, fetchSuppliers, handleAddSupplier } = useSuppliers();

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
            {/* Admin Routes */}
            <Route
              path="/approval"
              element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <Approval supplier={suppliers} />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Sales Orders */}
            <Route
              path="/"
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
                <SalesInvoice
                  invoices={invoices}
                  onfetchInvoices={fetchInvoices}
                  customers={customers}
                  page={invoicePagination.page}
                  setPage={invoicePagination.setPage}
                  limit={invoicePagination.limit}
                  setLimit={invoicePagination.setLimit}
                  totalRows={invoicePagination.totalRows}
                />
              }
            />

            {/* Inventory */}
            <Route
              path="/inventory/item"
              element={<Item onItemsUpdate={fetchItems} />}
            />
            <Route
              path="/inventory"
              element={
                <Inventory
                  items={items}
                  onAddItem={handleAddItem}
                  onRefreshItems={fetchItems}
                  page={inventoryPagination.page}
                  setPage={inventoryPagination.setPage}
                  limit={inventoryPagination.limit}
                  setLimit={inventoryPagination.setLimit}
                  totalRows={inventoryPagination.totalRows}
                />
              }
            />

            {/* Suppliers */}
            <Route
              path="/supplier"
              element={
                <Supplier
                  supplier={suppliers}
                  onAddSupplier={handleAddSupplier}
                  onRefreshSupplier={fetchSuppliers}
                />
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
