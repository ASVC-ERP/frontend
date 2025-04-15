import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import necessary components
import Sidebar from "./Components/Sidebar.jsx";
import SalesOrder from "./Components/SalesOrder.jsx";
import CreateOrder from "./Components/CreateOrder.jsx"; // Assuming CreateOrder is the new page
import "./App.css";
import { useState } from "react";  // Import useState
import Swal from 'sweetalert2'

function App() {
    const [orders, setOrders] = useState({
      ORD001: {
      orderId: "ORD001",
      date: "2025-04-15",
      customerName: "Liza Santos",
      customerNumber: "09123580949",
      customerAddress: "Makati",
      delivery: "2",
      salesAgent: "Mark Reyes",
      status: "Delivered",
      orderItems: [
        {
          name: "Exhaust Muffler",
          price: { original: 2000, markup1: 2200, markup2: 2400 },
          selectedMarkup: "markup2",
          stock: 5,
          quantity: 1,
        },
        {
          name: "Oil Filter",
          price: { original: 200, markup1: 220, markup2: 240 },
          selectedMarkup: "markup1",
          stock: 50,
          quantity: 4,
        }
      ],
      totalPrice: 3080,
    },
    ORD002: {
      orderId: "ORD002",
      date: "2025-04-15",
      customerName: "Jake Dela Cruz",
      customerNumber: "09173452911",
      customerAddress: "Quezon City",
      delivery: "1",
      salesAgent: "Anna Lim",
      status: "Processing",
      orderItems: [
        {
          name: "Alternator",
          price: { original: 1500, markup1: 1650, markup2: 1800 },
          selectedMarkup: "markup2",
          stock: 12,
          quantity: 2,
        },
        {
          name: "Brake Pads",
          price: { original: 800, markup1: 880, markup2: 960 },
          selectedMarkup: "markup2",
          stock: 30,
          quantity: 2,
        }
      ],
      totalPrice: 5520,
    },
    ORD003: {
        orderId: "ORD003",
        date: "2025-04-14",
        customerName: "Carlos Mendoza",
        customerNumber: "09893653735",
        customerAddress: "Cebu",
        delivery: "2",
        salesAgent: "Mark Reyes",
        status: "Cancelled",
        orderItems: [
          {
            name: "Radiator",
            price: {
              original: 2500,
              markup1: 2750,
              markup2: 3000
            },
            selectedMarkup: "markup2",
            stock: 11,
            quantity: 1
          },
          {
            name: "Fuel Pump",
            price: {
              original: 1200,
              markup1: 1320,
              markup2: 1440
            },
            selectedMarkup: "markup2",
            stock: 5,
            quantity: 1
          }
        ],
        totalPrice: 4440
      },
      ORD004: {
        orderId: "ORD004",
        date: "2025-04-15",
        customerName: "Carlos Mendoza",
        customerNumber: "09604707145",
        customerAddress: "Cebu",
        delivery: "3",
        salesAgent: "Mark Reyes",
        status: "Cancelled",
        orderItems: [
          {
            name: "Timing Belt",
            price: {
              original: 1000,
              markup1: 1100,
              markup2: 1200
            },
            selectedMarkup: "markup1",
            stock: 8,
            quantity: 4
          },
          {
            name: "Radiator",
            price: {
              original: 2500,
              markup1: 2750,
              markup2: 3000
            },
            selectedMarkup: "markup2",
            stock: 3,
            quantity: 3
          }
        ],
        totalPrice: 13400
      },
      ORD005: {
        orderId: "ORD005",
        date: "2025-04-10",
        customerName: "Bea Cruz",
        customerNumber: "09378480667",
        customerAddress: "Pasig",
        delivery: "1",
        salesAgent: "Lara Dy",
        status: "Pending",
        orderItems: [
          {
            name: "Air Filter",
            price: {
              original: 300,
              markup1: 330,
              markup2: 360
            },
            selectedMarkup: "markup1",
            stock: 3,
            quantity: 1
          },
          {
            name: "Fuel Pump",
            price: {
              original: 1200,
              markup1: 1320,
              markup2: 1440
            },
            selectedMarkup: "markup2",
            stock: 7,
            quantity: 5
          }
        ],
        totalPrice: 7530
      }
    }); // Shared state

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    
    const [info, setInfo] = useState({
        customerName: "",
        customerNumber: "",
        customerAddress: "",
        salesAgent: "Prince 兄",
        delivery: "1"
    });

    const [products] = useState([
        {
            name: 'Alternator',
            price: { original: 1500, markup1: 1650, markup2: 1800 },
            stock: 12,
        },
        {
            name: 'Brake Pads',
            price: { original: 800, markup1: 880, markup2: 960 },
            stock: 30,
        },
        {
            name: 'Brake Rotors',
            price: { original: 1200, markup1: 1320, markup2: 1440 },
            stock: 20,
        },
        {
            name: 'Clutch Kit',
            price: { original: 2500, markup1: 2750, markup2: 3000 },
            stock: 8,
        },
        {
            name: 'Control Arm',
            price: { original: 1000, markup1: 1100, markup2: 1200 },
            stock: 14,
        },
        {
            name: 'CV Axle',
            price: { original: 1300, markup1: 1430, markup2: 1560 },
            stock: 10,
        },
        {
            name: 'Drive Belt',
            price: { original: 400, markup1: 440, markup2: 480 },
            stock: 25,
        },
        {
            name: 'Engine Mount',
            price: { original: 700, markup1: 770, markup2: 840 },
            stock: 18,
        },
        {
            name: 'Exhaust Muffler',
            price: { original: 2000, markup1: 2200, markup2: 2400 },
            stock: 5,
        },
        {
            name: 'Fuel Pump',
            price: { original: 1800, markup1: 1980, markup2: 2160 },
            stock: 9,
        },
        {
            name: 'Headlight Assembly',
            price: { original: 1500, markup1: 1650, markup2: 1800 },
            stock: 6,
        },
        {
            name: 'Ignition Coil',
            price: { original: 600, markup1: 660, markup2: 720 },
            stock: 1,
        },
        {
            name: 'Oil Filter',
            price: { original: 200, markup1: 220, markup2: 240 },
            stock: 50,
        },
        {
            name: 'Oxygen Sensor',
            price: { original: 900, markup1: 990, markup2: 1080 },
            stock: 13,
        },
        {
            name: 'Power Steering Pump',
            price: { original: 1900, markup1: 2090, markup2: 2280 },
            stock: 7,
        },
        {
            name: 'Radiator',
            price: { original: 2200, markup1: 2420, markup2: 2640 },
            stock: 4,
        },
        {
            name: 'Shock Absorbers',
            price: { original: 1700, markup1: 1870, markup2: 2040 },
            stock: 11,
        },
        {
            name: 'Spark Plugs',
            price: { original: 300, markup1: 330, markup2: 360 },
            stock: 40,
        },
        {
            name: 'Starter Motor',
            price: { original: 1600, markup1: 1760, markup2: 1920 },
            stock: 6,
        },
        {
            name: 'Strut Assembly',
            price: { original: 2100, markup1: 2310, markup2: 2520 },
            stock: 5,
        },
        {
            name: 'Thermostat',
            price: { original: 500, markup1: 550, markup2: 600 },
            stock: 22,
        },
        {
            name: 'Timing Belt',
            price: { original: 1100, markup1: 1210, markup2: 1320 },
            stock: 16,
        },
        {
            name: 'Transmission Filter',
            price: { original: 900, markup1: 990, markup2: 1080 },
            stock: 17,
        },
        {
            name: 'Water Pump',
            price: { original: 1400, markup1: 1540, markup2: 1680 },
            stock: 12,
        },
        {
            name: 'Windshield Wiper Motor',
            price: { original: 1300, markup1: 1430, markup2: 1560 },
            stock: 8,
        },
        ]);

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
        const filtered = products.filter((p) =>
            p.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        } else {
        setSuggestions([]);
        }
    };
    
    const handleSelectProduct = (product) => {
        const alreadyInOrder = orderItems.some(item => item.name === product.name);
    
        if (alreadyInOrder) {
        Swal.fire({
            icon: 'warning',
            title: 'Duplicate Product',
            text: `${product.name} is already in the order list.`,
            confirmButtonColor: '#0C1D61'
        });

        setQuery('');
        setSuggestions([]);
        return;
        }
    
        setOrderItems([
        ...orderItems,
        {
            ...product,
            selectedMarkup: 'markup1',
            quantity: 1,
        },
        ]);
        setQuery('');
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
        const updatedItems = orderItems.filter((_, index) => index !== indexToRemove);
        setOrderItems(updatedItems);
        };



  
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
              <Route path="/" element={<SalesOrder orders={Object.values(orders)}/>} />
              <Route path="/create-order" 
                      element={<CreateOrder 
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
                      onAddOrder={handleAddOrder} />} 
                      />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
