import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

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

function App() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  // When logged in, store in localStorage
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  // Optional: Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  //** SALES MODULE **//
  const [orders, setOrders] = useState({});

  useEffect(() => {
    axios
      .get(`${API_URL}/order`)
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
      });
  }, []);

  const [info, setInfo] = useState({
    customerID: "",
    customerName: "",
    customerNumber: "",
    customerAddress: "",
    salesAgent: "",
    discount: 0,
    delivery: "1",
  });

  const handleAddOrder = (newOrder) => {
    setOrders((prevOrders) => ({
      ...prevOrders,
      [newOrder.orderId]: newOrder,
    }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 0) {
      const filtered = items.filter(
        (p) =>
          p.itemName.toLowerCase().includes(value.toLowerCase()) ||
          p.itemCode.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectProduct = (items) => {
    if (orderItems.length >= 16) {
      Swal.fire({
        icon: "warning",
        iconColor: "#950606",
        title: "Item Limit Reached",
        text: "You can only add up to 16 products per order.",
        confirmButtonColor: "#1E5A84",
      });
      setQuery("");
      setSuggestions([]);
      return;
    }

    const alreadyInOrder = orderItems.some(
      (item) => item.itemName === items.itemName
    );

    if (alreadyInOrder) {
      Swal.fire({
        icon: "warning",
        iconColor: "#1E5A84",
        title: "Duplicate Product",
        text: `${items.itemName} is already in the order list.`,
        confirmButtonColor: "#1E5A84",
      });

      setQuery("");
      setSuggestions([]);
      return;
    }
    console.log("Selected product:", items);
    setOrderItems([
      ...orderItems,
      {
        ...items,
        selectedMarkup: "price1",
        quantity: 1,
      },
    ]);
    setQuery("");
    setSuggestions([]);
  };

  const handlePriceChange = (index, selectedPriceColumn, isCustom = false) => {
    const updatedItems = [...orderItems];

    if (isCustom) {
      // When user types a custom price
      updatedItems[index].customPrice = selectedPriceColumn;
    } else {
      // When user picks a column (price1, price2, etc.)
      updatedItems[index].selectedMarkup = selectedPriceColumn;
      updatedItems[index].customPriceEnabled = false;
    }

    setOrderItems(updatedItems);
  };

  const handleEnableCustomPrice = (index) => {
    const updatedItems = [...orderItems];
    updatedItems[index].customPriceEnabled = true;
    updatedItems[index].customPrice = "";
    setOrderItems(updatedItems);
  };

  const handleDisableCustomPrice = (index) => {
    const updated = [...orderItems];
    updated[index].customPriceEnabled = false;
    updated[index].customPrice = "";
    setOrderItems(updated);
  };

  const updateOrderItem = (index, key, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index][key] = value;
    setOrderItems(updatedItems);
  };

  const calculateTotal = (item) => {
    const unitPrice = item.customPriceEnabled
      ? parseFloat(item.customPrice) || 0
      : parseFloat(item[item.selectedMarkup]) || 0; // <- use column name directly

    const quantity = parseInt(item.quantity) || 0;
    return unitPrice * quantity;
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      const unitPrice = item.customPriceEnabled
        ? parseFloat(item.customPrice) || 0
        : parseFloat(item[item.selectedMarkup]) || 0;

      const quantity = parseInt(item.quantity) || 0;
      return total + unitPrice * quantity;
    }, 0);
  };

  const handleRemoveProduct = (indexToRemove) => {
    const updatedItems = orderItems.filter(
      (_, index) => index !== indexToRemove
    );
    setOrderItems(updatedItems);
  };

  //** INVOICE MODULE **//
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = () => {
    axios
      .get(`${API_URL}/invoices`)
      .then((response) => {
        setInvoices(response.data);
      })
      .catch((error) => {
        console.error("Error fetching invoices:", error);
      });
    console.log("Fetched invoices:", invoices);
  };

  //** INVENTORY MODULE **//

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, [page, limit]);

  const fetchItems = () => {
    axios
      .get(`${API_URL}/product`, {
        params: {
          page: page,
          limit: limit,
        },
      })
      .then((response) => {
        const transformedItems = response.data.data.map((item) => ({
          itemID: item.id,
          itemCode: item.item_code,
          itemName: item.item_name,
          brand: item.brand,
          origin: item.origin,
          stock: item.stock,
          price1: item.price1,
          price2: item.price2,
          price3: item.price3,
          price4: item.price4,
          minStock: item.min_stock,
          partNum: item.part_num,
          interNum: item.internal_num,
          unit: item.unit,
          model: item.model,
        }));
        setItems(transformedItems);
        setTotalRows(response.data.meta.total);
      })
      .catch((error) => {
        console.error("Error fetching items from backend:", error);
      });
  };

  const handleAddItem = async (newItem) => {
    console.log("📦 Submitting item in App:", newItem);

    Swal.fire({
      title: "Adding Item",
      text: "Please wait while we add the new item...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      console.log("Posting to API:", `${API_URL}/product`, newItem);
      const response = await axios.post(`${API_URL}/product`, newItem);
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Item added successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchItems(); // refresh list
      return true; // ✅ success
    } catch (err) {
      Swal.close();

      console.log("Error adding item:", err);

      if (err.response?.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Item",
          text: err.response.data.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again later.",
        });
      }

      return false; // ❌ failed
    }
  };

  //** SUPPLIER MODULE **//
  const [supplier, setSupplier] = useState([]);

  const fetchSupplier = () => {
    axios
      .get(`${API_URL}/supplier`)
      .then((response) => {
        const transformedSuppliers = response.data.map((supplier) => ({
          id: supplier.id,
          sid: supplier.sid,
          name: supplier.name,
          address: supplier.address,
          currency: supplier.currency,
          number: supplier.number,
        }));
        setSupplier(transformedSuppliers);
      })
      .catch((error) => {
        console.error("Error fetching suppliers from backend:", error);
      });
  };

  useEffect(() => {
    fetchSupplier();
  }, []);

  const handleAddSupplier = (newSupplier) => {
    console.log("📦 Submitting supplier:", newSupplier);

    Swal.fire({
      title: "Adding Supplier",
      text: "Please wait while we add a new supplier...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    axios
      .post(`${API_URL}/supplier`, newSupplier)
      .then((response) => {
        Swal.close();
        Swal.fire({
          icon: "success",
          title: "Supplier added!",
          text: response.data.message || "Supplier added successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchSupplier();
      })
      .catch((err) => {
        console.error("Error adding supplier:", err);

        if (err.response) {
          // Backend responded with an error
          if (err.response.status === 409) {
            Swal.fire({
              icon: "error",
              title: "Duplicate Supplier",
              text:
                err.response.data.message || "This supplier already exists.",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                err.response.data.message ||
                "Something went wrong. Please try again later.",
            });
          }
        } else if (err.request) {
          // Request was made but no response (network/server down)
          Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Unable to reach the server. Please check your connection.",
          });
        } else {
          // Something else (e.g., code error)
          Swal.fire({
            icon: "error",
            title: "Unexpected Error",
            text: err.message,
          });
        }
      });
  };

  //* CUSTOMER MODULE **//
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = () => {
    axios
      .get(`${API_URL}/customer`)
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <Router>
      {isAuthenticated ? (
        <div className="container-fluid vh-100 d-flex p-0">
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
          {/* Main content */}
          <div className="flex-grow-1 d-flex flex-column p-0">
            <Routes>
              <Route
                path="/approval"
                element={
                  <ProtectedRoute user={user} requiredRole="admin">
                    <Approval supplier={supplier} />
                  </ProtectedRoute>
                }
              />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route
                path="/"
                element={
                  <SalesOrder
                    orders={Object.values(orders)}
                    setOrders={setOrders}
                    customers={customers}
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
              <Route
                path="/invoice"
                element={
                  <SalesInvoice
                    invoices={invoices}
                    onfetchInvoices={fetchInvoices}
                    customers={customers}
                  />
                }
              />

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
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    totalRows={totalRows}
                  />
                }
              />
              <Route
                path="/supplier"
                element={
                  <Supplier
                    supplier={supplier}
                    onAddSupplier={handleAddSupplier}
                    onRefreshSupplier={fetchSupplier}
                  />
                }
              />
              <Route
                path="/supplier/invoices"
                element={<SupplierInvoicesTable items={items} />}
              />
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
          <ProfileModal user={user} />;
        </div>
      ) : (
        <Routes>
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/order" : "/login"} />}
          />
        </Routes>
      )}
    </Router>
  );
}

export default App;
