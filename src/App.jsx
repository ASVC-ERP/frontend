import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

import Sidebar from "./Components/Sidebar.jsx";
import SalesOrder from "./Components/Orders/SalesOrder.jsx";
import CreateOrder from "./Components/Orders/CreateOrder.jsx";
import Inventory from "./Components/Inventory/Inventory.jsx";
import Item from "./Components/Inventory/SpecificItem/Item.jsx";
import AddItem from "./Components/Inventory/SpecificItem/AddItem.jsx";
import Supplier from "./Components/Supplier/Supplier.jsx";
import SupplierInvoicesTable from "./Components/Supplier/SpecificSupplier/SupplierInvoicesTable.jsx";
import AddSupplier from "./Components/Supplier/AddSupplier.jsx";

function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

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
    const unitPrice = item[item.selectedMarkup];
    return unitPrice * item.quantity;
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      const selectedPrice = item[item.selectedMarkup];
      const quantity = item.quantity;

      // Ensure the values are valid numbers
      const validSelectedPrice = isNaN(selectedPrice) ? 0 : selectedPrice;
      const validQuantity = isNaN(quantity) ? 0 : quantity;

      return total + validSelectedPrice * validQuantity;
    }, 0);
  };

  const handleRemoveProduct = (indexToRemove) => {
    const updatedItems = orderItems.filter(
      (_, index) => index !== indexToRemove
    );
    setOrderItems(updatedItems);
  };

  const handleReserve = (items) => {
    const reserveQty = orderItems;
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
          photo: item.photo,
          stock: item.stock,
          price1: item.price1,
          price2: item.price2,
          price3: item.price3,
          price4: item.price4,
        }));
        setItems(transformedItems);
      })
      .catch((error) => {
        console.error("Error fetching items from backend:", error);
      });
  };

  const handleAddItem = (newItem) => {
    axios
      .post("http://localhost:3000/add_item", newItem)
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

  const [supplier, setSupplier] = useState([]);

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
    setSupplier((prevSupplier) => [...prevSupplier, newSupplier]);
  };

  return (
    <Router>
      <div className="container-fluid vh-100 d-flex p-0">
        {/* Sidebar (static, slightly wider) */}
        <div
          style={{
            width: "200px",
            backgroundColor: "#E8E7EC",
            fontFamily: "'Outfit', sans-serif",
            overflow: "hidden",
          }}
          className="d-flex flex-column"
        >
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-grow-1 d-flex flex-column p-0">
          <Routes>
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
            <Route
              path="/inventory"
              element={<Inventory products={Object.values(items)} />}
            />
            <Route path="/inventory/item" element={<Item />} />
            <Route
              path="/add-item"
              element={
                <AddItem
                  onAddItem={handleAddItem}
                  items={items}
                  setItems={setItems}
                />
              }
            />
            <Route
              path="/supplier"
              element={<Supplier supplier={Object.values(supplier)} />}
            />
            <Route
              path="/supplier/invoices"
              element={<SupplierInvoicesTable />}
            />
            <Route
              path="/add-supplier"
              element={
                <AddSupplier
                  onAddSupplier={handleAddSupplier}
                  supplier={supplier}
                  setSupplier={setSupplier}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
