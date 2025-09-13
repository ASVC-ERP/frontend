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
      .get("http://localhost:3000/orders")
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
      });
  }, []);

  const [info, setInfo] = useState({
    customerName: "",
    customerNumber: "",
    customerAddress: "",
    salesAgent: "Prince 兄",
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
      const filtered = items.filter((p) =>
        p.itemName.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectProduct = (items) => {
    const alreadyInOrder = orderItems.some(
      (item) => item.itemName === items.itemName
    );

    if (alreadyInOrder) {
      Swal.fire({
        icon: "warning",
        iconColor: "#0C1D61",
        title: "Duplicate Product",
        text: `${items.itemName} is already in the order list.`,
        confirmButtonColor: "#0C1D61",
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

  const handlePriceChange = (index, newMarkup) => {
    const updatedItems = [...orderItems];
    updatedItems[index].selectedMarkup = newMarkup;
    setOrderItems(updatedItems);
  };

  const updateOrderItem = (index, key, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index][key] = value;
    setOrderItems(updatedItems);
  };

  const calculateTotal = (item) => {
    const unitPrice = item.price?.[item.selectedMarkup];
    return unitPrice * item.quantity;
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      const selectedPrice = item.price?.[item.selectedMarkup]; // <-- access inside price
      const quantity = item.quantity;

      const validSelectedPrice = parseFloat(selectedPrice) || 0;
      const validQuantity = parseInt(quantity) || 0;

      return total + validSelectedPrice * validQuantity;
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
      .get("http://localhost:3000/invoice")
      .then((response) => {
        setInvoices(response.data);
      })
      .catch((error) => {
        console.error("Error fetching invoices:", error);
      });
  };

  //** INVENTORY MODULE **//

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    axios
      .get("http://localhost:3000/items")
      .then((response) => {
        const transformedItems = response.data.map((item) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          brand: item.brand,
          origin: item.origin,
          stock: item.stock,
          price: item.price,
          minStock: item.minStock,
        }));
        setItems(transformedItems);
      })
      .catch((error) => {
        console.error("Error fetching items from backend:", error);
      });
  };

  const handleAddItem = (newItem) => {
    console.log("📦 Submitting item:", newItem);
    axios
      .post("http://localhost:3000/items", newItem)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Item added successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchItems();
      })
      .catch((err) => {
        console.error("Error adding item:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to add item. Please try again.",
        });
      });
  };

  //** SUPPLIER MODULE **//
  const [supplier, setSupplier] = useState([]);

  const fetchSupplier = () => {
    axios
      .get("http://localhost:3000/suppliers")
      .then((response) => {
        const transformedSuppliers = response.data.map((supplier) => ({
          id: supplier.id,
          name: supplier.name,
          address: supplier.address,
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
    axios
      .post("http://localhost:3000/suppliers", newSupplier)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Supplier added!",
          text: "Supplier added successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchSupplier(); // refetch updated data
      })
      .catch((err) => {
        console.error("Error adding supplier:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to add supplier. Please try again.",
        });
      });
  };

  /*

  useEffect(() => {
    axios
      .get("http://localhost:3000/suppliers")
      .then((response) => {
        setSupplier(response.data);
      })
      .catch((error) => {
        console.error("Error fetching suppliers:", error);
      });
  }, []);

  const handleAddSupplier = (newSupplier) => {
    console.log("📦 Submitting Supplier:", newItem);
    axios
      .post("http://localhost:3000/suppliers", newItem)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Item added successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchItems();
      })
      .catch((err) => {
        console.error("Error adding item:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to add item. Please try again.",
        });
      });
  };
  */

  //* CUSTOMER MODULE **//
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/customers")
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const fetchCustomers = () => {
    axios
      .get("http://localhost:3000/customers")
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err));
};

  return (
    <Router>
      {isAuthenticated ? (
        <div className="container-fluid vh-100 d-flex p-0">
          <div
            style={{
              width: "200px",
              backgroundColor: "#E8E7EC",
              fontFamily: "'Outfit', sans-serif",
              overflow: "hidden",
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
                element={<SalesOrder orders={Object.values(orders)} />}
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
              <Route path="/invoice" element={<SalesInvoice invoices={invoices} onfetchInvoices={fetchInvoices} />} />

              <Route
                path="/inventory/item"
                element={<Item onItemsUpdate={fetchItems} />}
              />
              <Route
                path="/inventory"
                element={<Inventory items={items} onAddItem={handleAddItem} onRefreshItems={fetchItems}/>}
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
                element={<SupplierInvoicesTable items={items}/>}
              />
              <Route
                path="/customer"
                element={<Customer customers={customers} onRefreshCustomers={fetchCustomers} />}
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
