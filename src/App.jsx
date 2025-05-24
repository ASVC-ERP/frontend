import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

import Sidebar from "./Components/Sidebar.jsx";
import SalesOrder from "./Components/SalesOrder.jsx";
import CreateOrder from "./Components/CreateOrder.jsx";
import Inventory from "./Components/Inventory.jsx";
import Item from "./Components/Item.jsx";
import AddItem from "./Components/AddItem.jsx";
import Supplier from "./Components/Supplier.jsx";
import AddSupplier from "./Components/AddSupplier.jsx";

function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSidebarCollapse = (collapse) => {
    setIsCollapsed(collapse);
  };

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
        selectedMarkup: "original",
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
    const unitPrice = item.price[item.selectedMarkup];
    return unitPrice * item.quantity;
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      const selectedPrice = item.price[item.selectedMarkup];
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
          price: {
            original: item.original,
            markup1: item.markup1,
            markup2: item.markup2,
          },
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

  const [supplier, setSupplier] = useState([
    {
      name: "ABC Suppliers",
      address: "123 Main Street, City A",
      invoiceDate: "2025-05-12",
      quantity: 100,
      items: "Laptops",
      description: "High-performance laptops for office use",
      gPrice: "1000.00",
      discount: "10%",
      nPrice: "900.00",
      totalValue: "90,000.00",
    },
    {
      name: "XYZ Traders",
      address: "456 Elm Street, City B",
      invoiceDate: "2025-05-11",
      quantity: 50,
      items: "Smartphones",
      description: "Latest model smartphones with warranty",
      gPrice: "500.00",
      discount: "5%",
      nPrice: "475.00",
      totalValue: "23,750.00",
    },
    {
      name: "Global Supplies",
      address: "789 Maple Avenue, City C",
      invoiceDate: "2025-05-10",
      quantity: 200,
      items: "Office Chairs",
      description: "Ergonomic chairs for office use",
      gPrice: "80.00",
      discount: "15%",
      nPrice: "68.00",
      totalValue: "13,600.00",
    },
    {
      name: "Prime Traders",
      address: "101 Oak Road, City D",
      invoiceDate: "2025-05-09",
      quantity: 30,
      items: "Projectors",
      description: "High-definition projectors for presentations",
      gPrice: "300.00",
      discount: "0%",
      nPrice: "300.00",
      totalValue: "9,000.00",
    },
    {
      name: "Local Distributors",
      address: "202 Pine Lane, City E",
      invoiceDate: "2025-05-08",
      quantity: 150,
      items: "Desk Lamps",
      description: "Adjustable LED desk lamps",
      gPrice: "20.00",
      discount: "5%",
      nPrice: "19.00",
      totalValue: "2,850.00",
    },
    {
      name: "United Suppliers",
      address: "303 Cedar Blvd, City F",
      invoiceDate: "2025-05-07",
      quantity: 80,
      items: "Monitors",
      description: "24-inch Full HD monitors",
      gPrice: "150.00",
      discount: "10%",
      nPrice: "135.00",
      totalValue: "10,800.00",
    },
    {
      name: "Tech Solutions",
      address: "404 Spruce Street, City G",
      invoiceDate: "2025-05-06",
      quantity: 60,
      items: "Keyboards",
      description: "Wireless mechanical keyboards",
      gPrice: "40.00",
      discount: "12%",
      nPrice: "35.20",
      totalValue: "2,112.00",
    },
    {
      name: "Metro Suppliers",
      address: "505 Birch Way, City H",
      invoiceDate: "2025-05-05",
      quantity: 120,
      items: "Mice",
      description: "Ergonomic wireless mice",
      gPrice: "15.00",
      discount: "8%",
      nPrice: "13.80",
      totalValue: "1,656.00",
    },
    {
      name: "Bright Industries",
      address: "606 Willow Lane, City I",
      invoiceDate: "2025-05-04",
      quantity: 40,
      items: "Printers",
      description: "Multifunction laser printers",
      gPrice: "200.00",
      discount: "7%",
      nPrice: "186.00",
      totalValue: "7,440.00",
    },
    {
      name: "Elite Traders",
      address: "707 Fir Road, City J",
      invoiceDate: "2025-05-03",
      quantity: 25,
      items: "Scanners",
      description: "High-speed document scanners",
      gPrice: "250.00",
      discount: "5%",
      nPrice: "237.50",
      totalValue: "5,937.50",
    },
  ]);

  const handleAddSupplier = (newSupplier) => {
    setSupplier((prevSupplier) => [...prevSupplier, newSupplier]);
  };

  return (
    <Router>
      {/* Wrap the entire app with Router */}
      <div className="container-fluid vh-100">
        <div className="row h-100">
          <div
            className={`col-${
              isCollapsed ? "1" : "2"
            } overflow-hidden d-flex flex-column`}
            style={{
              backgroundColor: "#E8E7EC",
              fontFamily: "'Outfit', sans-serif",
              transition: "width 0.3s ease",
            }}
          >
            <Sidebar collapsed={isCollapsed} />
          </div>
          <div
            className={`col-${
              isCollapsed ? "11" : "10"
            } d-flex flex-column p-0`}
          >
            {/* Define routes here */}
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
              <Route
                path="/inventory/item"
                element={<Item handleSidebarCollapse={handleSidebarCollapse} />}
              ></Route>
              <Route
                path="/add-item"
                element={
                  <AddItem
                    onAddItem={handleAddItem}
                    items={items}
                    setItems={setItems}
                  />
                }
              ></Route>
              <Route
                path="/supplier"
                element={<Supplier supplier={Object.values(supplier)} />}
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
              ></Route>
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
