import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import necessary components
import Sidebar from "./Components/Sidebar.jsx";
import SalesOrder from "./Components/SalesOrder.jsx";
import CreateOrder from "./Components/CreateOrder.jsx"; // Assuming CreateOrder is the new page
import "./App.css";
import { useState } from "react";  // Import useState
import Swal from 'sweetalert2'
import Inventory from "./Components/Inventory.jsx";

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
          itemCode: 1,
          itemName: 'Alternator',
          brand: 'Bosch',
          origin: 'Germany',
          photo: 'defaultPic',
          price: { original: 1500, markup1: 1650, markup2: 1800 },
          stock: 12,
      },
      {
          itemCode: 2,
          itemName: 'Brake Pads',
          brand: 'Brembo',
          origin: 'Italy',
          photo: 'defaultPic',
          price: { original: 800, markup1: 880, markup2: 960 },
          stock: 30,
      },
      {
          itemCode: 3,
          itemName: 'Brake Rotors',
          brand: 'Bendix',
          origin: 'USA',
          photo: 'defaultPic',
          price: { original: 1200, markup1: 1320, markup2: 1440 },
          stock: 20,
      },
      {
          itemCode: 4,
          itemName: 'Clutch Kit',
          brand: 'Exedy',
          origin: 'Japan',
          photo: 'defaultPic',
          price: { original: 2500, markup1: 2750, markup2: 3000 },
          stock: 8,
      },
      {
          itemCode: 5,
          itemName: 'Control Arm',
          brand: 'Moog',
          origin: 'USA',
          photo: 'defaultPic',
          price: { original: 1000, markup1: 1100, markup2: 1200 },
          stock: 14,
      },
      {
          itemCode: 6,
          itemName: 'CV Axle',
          brand: 'GSP',
          origin: 'China',
          photo: 'defaultPic',
          price: { original: 1300, markup1: 1430, markup2: 1560 },
          stock: 10,
      },
      {
          itemCode: 7,
          itemName: 'Drive Belt',
          brand: 'Dayco',
          origin: 'USA',
          photo: 'defaultPic',
          price: { original: 400, markup1: 440, markup2: 480 },
          stock: 25,
      },
      {
          itemCode: 8,
          itemName: 'Engine Mount',
          brand: 'Anchor',
          origin: 'USA',
          photo: 'defaultPic',
          price: { original: 700, markup1: 770, markup2: 840 },
          stock: 18,
      },
      {
          itemCode: 9,
          itemName: 'Exhaust Muffler',
          brand: 'MagnaFlow',
          origin: 'USA',
          photo: 'defaultPic',
          price: { original: 2000, markup1: 2200, markup2: 2400 },
          stock: 5,
      },
      {
          itemCode: 10,
          itemName: 'Fuel Pump',
          brand: 'Delphi',
          origin: 'UK',
          photo: 'defaultPic',
          price: { original: 1800, markup1: 1980, markup2: 2160 },
          stock: 9,
      },
      {
          itemCode: 11,
          itemName: 'Headlight Assembly',
          brand: 'TYC',
          origin: 'Taiwan',
          photo: 'defaultPic',
          price: { original: 1500, markup1: 1650, markup2: 1800 },
          stock: 6,
      },
      {
          itemCode: 12,
          itemName: 'Ignition Coil',
          brand: 'NGK',
          origin: 'Japan',
          photo: 'defaultPic',
          price: { original: 600, markup1: 660, markup2: 720 },
          stock: 1,
      },
      {
          itemCode: 13,
          itemName: 'Oil Filter',
          brand: 'Fram',
          origin: 'USA',
          photo: 'defaultPic',
          price: { original: 200, markup1: 220, markup2: 240 },
          stock: 50,
      },
      {
          itemCode: 14,
          itemName: 'Oxygen Sensor',
          brand: 'Denso',
          origin: 'Japan',
          photo: 'defaultPic',
          price: { original: 900, markup1: 990, markup2: 1080 },
          stock: 13,
      },
      {
          itemCode: 15,
          itemName: 'Power Steering Pump',
          brand: 'ACDelco',
          origin: 'USA',
          photo: 'defaultPic',
          price: { original: 1900, markup1: 2090, markup2: 2280 },
          stock: 7,
      },
      {
          itemCode: 16,
          itemName: 'Radiator',
          brand: 'Denso',
          origin: 'Japan',
          photo: 'defaultPic',
          price: { original: 2200, markup1: 2420, markup2: 2640 },
          stock: 4,
      },
      {
          itemCode: 17,
          itemName: 'Shock Absorbers',
          brand: 'KYB',
          origin: 'Japan',
          photo: 'defaultPic',
          price: { original: 1700, markup1: 1870, markup2: 2040 },
          stock: 11,
      },
      {
          itemCode: 18,
          itemName: 'Spark Plugs',
          brand: 'Bosch',
          origin: 'Germany',
          photo: 'defaultPic',
          price: { original: 300, markup1: 330, markup2: 360 },
          stock: 40,
      },
      {
          itemCode: 19,
          itemName: 'Starter Motor',
          brand: 'Valeo',
          origin: 'France',
          photo: 'defaultPic',
          price: { original: 1600, markup1: 1760, markup2: 1920 },
          stock: 6,
      },
      {
          itemCode: 20,
          itemName: 'Strut Assembly',
          brand: 'Monroe',
          origin: 'USA',
          photo: 'defaultPic',
          price: { original: 2100, markup1: 2310, markup2: 2520 },
          stock: 5,
      },
      {
          itemCode: 21,
          itemName: 'Thermostat',
          brand: 'Stant',
          origin: 'USA',
          photo: 'defaultPic',
          price: { original: 500, markup1: 550, markup2: 600 },
          stock: 22,
      },
      {
          itemCode: 22,
          itemName: 'Timing Belt',
          brand: 'Gates',
          origin: 'USA',
          photo: 'defaultPic',
          price: { original: 1100, markup1: 1210, markup2: 1320 },
          stock: 16,
      },
      {
          itemCode: 23,
          itemName: 'Transmission Filter',
          brand: 'Mann-Filter',
          origin: 'Germany',
          photo: 'defaultPic',
          price: { original: 900, markup1: 990, markup2: 1080 },
          stock: 17,
      },
      {
          itemCode: 24,
          itemName: 'Water Pump',
          brand: 'Aisin',
          origin: 'Japan',
          photo: 'defaultPic',
          price: { original: 1400, markup1: 1540, markup2: 1680 },
          stock: 12,
      },
      {
          itemCode: 25,
          itemName: 'Windshield Wiper Motor',
          brand: 'Denso',
          origin: 'Japan',
          photo: 'defaultPic',
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
            p.itemName.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        } else {
        setSuggestions([]);
        }
    };
    
    const handleSelectProduct = (product) => {
        const alreadyInOrder = orderItems.some(item => item.name === product.itemName);
    
        if (alreadyInOrder) {
        Swal.fire({
            icon: 'warning',
            title: 'Duplicate Product',
            text: `${product.itemName} is already in the order list.`,
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
            selectedMarkup: 'original',
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
              <Route path="/inventory" element={<Inventory products={Object.values(products)}/>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
