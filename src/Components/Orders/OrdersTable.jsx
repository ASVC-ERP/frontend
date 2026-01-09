import {  useState, useEffect, useRef, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { Button } from "react-bootstrap";
import { IoIosSearch } from "react-icons/io";
import { IoChevronDown } from "react-icons/io5";
import axios from "axios";
import Swal from "sweetalert2";

const userApprove = JSON.parse(localStorage.getItem("user"));
const roleApprove = userApprove?.role || "";

const API_URL = import.meta.env.VITE_API_URL;

// Define table data
function OrdersTable({ orders, setOrders, customers }) {
  const customerMap = useMemo(() => {
    return customers.reduce((acc, customer) => {
      acc[customer.cid] = customer;
      return acc;
    }, {});
  }, [customers]);

  // Define table columns
  const columns = [
    {
      name: "Order ID",
      selector: (row) => row.order_code,
      sortable: true,
      grow: 0,
      minWidth: "130px",
    },
    {
      name: "Date",
      selector: (row) =>
        new Date(row.order_date).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "2-digit",
        }),
      sortable: true,
      grow: 0,
      minWidth: "100px",
    },
    {
      name: "Customer Name",
      selector: (row) => customerMap[row.cid]?.name || "—",
      sortable: true,
      grow: 3,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "Address",
      selector: (row) => customerMap[row.cid]?.address || "—",
      sortable: true,
      grow: 3,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "PIC",
      selector: (row) => row.sales_agent,
      sortable: true,
      grow: 0,
      width: "150px",
    },
    {
      name: "Status",
      selector: (row) => row.status, // <-- this enables sorting
      sortable: true,
      grow: 0,
      minWidth: "100px",
      cell: (row) => (
        <span
          className={`badge ${
            row.status === "Served"
              ? "bg-success"
              : row.status === "Partial Served"
              ? "bg-info text-dark"
              : row.status === "Open"
              ? "bg-warning text-dark"
              : row.status === "Rejected"
              ? "bg-danger"
              : "bg-secondary"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      grow: 0,
      width: "100px",
      center: true,
      cell: (row) => (
        <Button
          variant="outline-danger"
          size="sm"
          className="p-1 d-flex align-items-center justify-content-center"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row);
          }}
          title="Delete"
        >
          🗑️
        </Button>
      ),
    },
  ];

  const [filteredData, setFilteredData] = useState(orders);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRow, setSelectedRow] = useState(null);
  const [editableRow, setEditableRow] = useState(null);

  const [showRowModal, setShowRowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const [customerQuery, setCustomerQuery] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState([]);

  const [showServeModal, setShowServeModal] = useState(false);
  const [serveData, setServeData] = useState([]);

  const inputRefs = useRef([]);

  const MAX_ITEMS = 16;
  const [itemLimitWarning, setItemLimitWarning] = useState(false);

  // Function to fetch orders
  const fetchOrders = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const endpoint =
      user.role === "agent"
        ? `${API_URL}/order?agent=${encodeURIComponent(
            user.firstName + " " + user.lastName
          )}`
        : `${API_URL}/order`;

    axios
      .get(endpoint)
      .then((res) => {
        setOrders(res.data);

        // ✅ Preserve search filter if user is currently searching
        if (searchTerm.trim() !== "") {
          const filtered = res.data.filter((row) =>
            Object.values(row).some((field) =>
              field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
          setFilteredData(filtered);
        } else {
          setFilteredData(res.data);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to fetch orders:", err);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-refresh orders every 5 seconds
  useEffect(() => {
    if (searchTerm.trim() !== "") return;

    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [searchTerm]);

  useEffect(() => {
    if (!customerQuery.trim()) {
      setCustomerSuggestions([]);
      return;
    }

    const filtered = customers.filter((c) =>
      c.customerName.toLowerCase().includes(customerQuery.toLowerCase())
    );

    setCustomerSuggestions(filtered);
  }, [customerQuery, customers]);

  const handleCustomerNameChange = (e) => {
    const value = e.target.value;

    setCustomerQuery(value);
    setEditableRow((prev) => ({
      ...prev,
      customerName: value,
    }));
  };

  const handleSelectCustomer = (customer) => {
    setCustomerQuery(customer.customerName);
    setCustomerSuggestions([]);

    setEditableRow((prev) => ({
      ...prev,
      customerName: customer.customerName,
      customerAddress: customer.customerAddress,
    }));
  };

  const fetchStocksForItems = async (itemCodes) => {
    try {
      const response = await axios.get(`${API_URL}/items/check-stocks`, {
        params: { itemCodes: itemCodes.join(",") },
      });

      return response.data.stocks;
    } catch (err) {
      console.error("Error fetching stocks:", err);
      return {};
    }
  };

  // Handle search input change
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = orders.filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const handleEdit = async (row) => {
    setShowRowModal(false);

    try {
      // Fetch latest inventory once
      const res = await axios.get(`${API_URL}/items`);
      const inventory = res.data.map((item) => {
        const prices = [
          item.price?.price1,
          item.price?.price2,
          item.price?.price3,
          item.price?.price4,
        ].filter((p) => p != null && !isNaN(p));

        console.log("💰 Extracted Prices for", item.itemName, ":", prices);

        return { ...item, prices };
      });

      // Match each ordered item to inventory
      const updatedOrderedItems = row.orderedItems.map((ordered) => {
        const match = inventory.find(
          (inv) =>
            inv.itemName.trim().toLowerCase() ===
            ordered.itemName.trim().toLowerCase()
        );

        const isCustom = !match?.prices.includes(Number(ordered.price));

        return {
          ...ordered,
          availablePrices: match ? match.prices : [],
          customPriceEnabled: isCustom, // mark as custom if not in price list
          customPrice: isCustom ? Number(ordered.price) : null, // store custom price
          price: isCustom ? null : Number(ordered.price), // store selected normal price
        };
      });

      setEditableRow({ ...row, orderedItems: updatedOrderedItems });
      setSelectedRow(row);
      setShowEditModal(true);
    } catch (err) {
      console.error("Error loading prices:", err);
    }
  };

  const handleRowClick = async (row) => {
    console.log("Row clicked:", row);

    try {
      // Fetch served data for this order
      const res = await fetch(`${API_URL}/orders/served-items/${row.orderId}`);
      const servedData = await res.json();
      console.log("Fetched served orders:", servedData);

      // Inject quantityServed directly into orderedItems
      const mergedItems = row.orderedItems.map((item) => {
        const servedItem = servedData.find((s) => s.itemName === item.itemName);

        // If found, assign quantityServed
        return {
          ...item,
          quantityServed: servedItem ? parseInt(servedItem.quantityServed) : 0,
        };
      });

      console.log("Merged Ordered Items with quantityServed:", mergedItems);

      // Update state with merged items
      setSelectedRow({ ...row, orderedItems: mergedItems });
      setEditableRow({ ...row, orderedItems: mergedItems });
      setIsEditing(false);
      setShowRowModal(true);
    } catch (err) {
      console.error("Error fetching served orders:", err);
    }
  };

  // Handle top-level inputs (customerName, status, etc.)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableRow((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new item row
  const addItem = () => {
    setEditableRow((prev) => {
      const currentCount = prev.orderedItems?.length || 0;

      if (currentCount === MAX_ITEMS - 1) {
        // going from 15 → 16
        setItemLimitWarning(true);
      }

      if (currentCount >= MAX_ITEMS) {
        return prev; // hard stop
      }

      const newItems = [
        ...(prev.orderedItems || []),
        { itemName: "", quantity: 1 },
      ];

      setActiveIndex(newItems.length - 1);
      return { ...prev, orderedItems: newItems };
    });

    setQuery("");
  };

  // Remove an item by index
  const removeItem = (index) => {
    setEditableRow((prev) => {
      const newItems = prev.orderedItems.filter((_, i) => i !== index);

      if (newItems.length < MAX_ITEMS) {
        setItemLimitWarning(false);
      }

      return { ...prev, orderedItems: newItems };
    });
  };

  // Update item field
  const updateItem = (index, field, value) => {
    setEditableRow((prev) => {
      const items = [...prev.orderedItems];
      let updatedItem = { ...items[index] };

      // Numeric fields
      const numericFields = ["quantity", "price", "customPrice"];

      if (numericFields.includes(field)) {
        updatedItem[field] = Number(value);
      } else {
        updatedItem[field] = value;
      }

      // Special handling for price mode switch
      if (field === "customPriceEnabled") {
        if (value === true) {
          // Switching to custom price mode
          updatedItem.customPrice = "";
        } else {
          // Switching back to preset price mode
          updatedItem.price = Number(updatedItem.price) || 0;
        }
      }

      items[index] = updatedItem;
      return { ...prev, orderedItems: items };
    });
  };

  const handleSave = async () => {
    try {
      // 🔹 Recalculate total price from ordered items
      const recalculatedTotal = (editableRow.orderedItems || []).reduce(
        (sum, item) => {
          const finalPrice = item.customPriceEnabled
            ? Number(item.customPrice) || 0
            : Number(item.price) || 0;

          return sum + finalPrice * (Number(item.quantity) || 0);
        },
        0
      );

      const payload = {
        orderId: editableRow.orderId,
        date: editableRow.date,
        customerName: editableRow.customerName,
        customerAddress: editableRow.customerAddress,
        customerNumber: editableRow.customerNumber,
        customerTIN: editableRow.customerTIN,
        approvalStatus: editableRow.approvalStatus,
        status: editableRow.status,
        salesAgent: editableRow.salesAgent,

        orderedItems: (editableRow.orderedItems || []).map((it) => ({
          itemName: it.itemName,
          quantity: Number(it.quantity) || 0,
          price: it.customPriceEnabled
            ? Number(it.customPrice) || 0
            : Number(it.price) || 0,
          unit: it.unit,
          itemCode: it.itemCode,
        })),

        totalPrice: recalculatedTotal,
      };

      console.log("Payload being sent:", payload);

      await axios.patch(`${API_URL}/orders/${editableRow.orderId}`, payload);

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === editableRow.orderId ? { ...payload } : o
        )
      );
      setFilteredData((prev) =>
        prev.map((o) =>
          o.orderId === editableRow.orderId ? { ...payload } : o
        )
      );
      setSelectedRow({ ...payload });
      setEditableRow({ ...payload });
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Order Updated",
        text: `Order ${editableRow.orderId} was updated successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });

      await fetchOrders();
      setShowEditModal(false);

      // ✅ Reopen the updated row after fetching data
      const updatedRow = { ...payload };
      handleRowClick(updatedRow);
    } catch (err) {
      console.error("Failed to update order:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update order. See console for details.",
      });
      setShowEditModal(false);
    }
  };

  const handleDelete = (row) => {
    Swal.fire({
      icon: "warning",
      title: "Delete Order",
      text: `Are you sure you want to delete order ${row.orderId}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${API_URL}/orders/${row.orderId}`)
          .then((res) => {
            // Remove from table UI
            setOrders((prev) =>
              prev.filter((item) => item.orderId !== row.orderId)
            );

            // If you use a fetchOrders() function
            if (typeof fetchOrders === "function") {
              fetchOrders();
            }

            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: `Order ${row.orderId} has been deleted successfully.`,
              timer: 1500,
              showConfirmButton: false,
            });
          })
          .catch((err) => {
            console.error("Failed to delete order:", err);
            Swal.fire({
              icon: "error",
              title: "Delete Failed",
              text: "Could not delete order. Check console for details.",
            });
          });
      }
    });
  };

  const handleSearchChange = async (index, value) => {
    setQuery(value);
    setActiveIndex(index);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/items?search=${value}`);

      // Map prices into array for dropdown
      const itemsWithPrices = res.data.map((item) => ({
        ...item,
        prices: [item.price1, item.price2, item.price3, item.price4].filter(
          (p) => p != null
        ),
      }));

      setSuggestions(itemsWithPrices);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    }
  };

  const handleSelectSuggestion = (index, item) => {
    console.log("Selected item:", item, "for row index:", index);

    setEditableRow((prev) => {
      console.log("Previous editableRow:", prev);
      const updatedItems = [...prev.orderedItems];
      const priceObj = item.price || {};
      updatedItems[index] = {
        ...updatedItems[index],
        itemName: item.itemName,
        itemCode: item.itemCode,
        stock: item.stock,
        quantity: 1,
        availablePrices: [
          priceObj.price1,
          priceObj.price2,
          priceObj.price3,
          priceObj.price4,
        ].filter((p) => p != null),
        price: priceObj.price1,
        unit: item.unit,
      };
      console.log("Updated items:", updatedItems);
      return { ...prev, orderedItems: updatedItems };
    });

    // clear search state
    setQuery("");
    setSuggestions([]);
    setActiveIndex(null);
  };

  /*
  const handleRequestInvoice = () => {
    setShowRequestModal(true); // Show the Request Invoice modal
    setShowRowModal(false); // Close the current order details modal (optional)
  };
*/

  const handlePrint = async () => {
    if (!selectedRow) return;

    console.log("selectedRow: ", selectedRow);

    try {
      const response = await axios.post(
        `${API_URL}/list/sales-order`,
        selectedRow,
        { responseType: "blob" } // important to handle PDF
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      Swal.fire({
        icon: "error",
        title: "Print Failed",
        text: "Failed to generate PDF. See console for details.",
      });
    }
  };

  const handleServe = async (row) => {
    setSelectedRow(row);

    // Step 1: Build payload as you already do
    const payload = {
      date: row.date,
      customerName: row.customerName,
      customerAddress: row.customerAddress,
      customerNumber: row.customerNumber,
      customerTIN: row.customerTIN || "",
      salesAgent: row.salesAgent,
      items: row.orderedItems.map((item) => ({
        itemName: item.itemName,
        price: item.price,
        quantityOrdered: item.quantity,
        quantityServed: item.quantity,
        quantityUnserved: 0,
        unit: item.unit || "",
        itemCode: item.itemCode || "",
      })),
    };

    try {
      // Step 2: Get item codes
      const itemCodes = payload.items.map((i) => i.itemCode).filter(Boolean);

      // Step 3: Fetch stock from backend
      const response = await axios.get(`${API_URL}/items/check-stocks`, {
        params: { itemCodes: itemCodes.join(",") },
      });

      const stocks = response.data.stocks || {};

      // Step 4: Merge stock into items
      payload.items = payload.items.map((item) => ({
        ...item,
        stock: stocks[item.itemCode] ?? 0,
      }));
    } catch (error) {
      console.error("Error fetching stock:", error);
      Swal.fire({
        icon: "error",
        title: "Stock Error",
        text: "Unable to fetch item stocks.",
      });
    }

    // Step 5: Continue your existing logic
    fetchOrders();
    setServeData(payload);
    setShowServeModal(true);
  };

  const updateServeQuantity = (index, field, value) => {
    setServeData((prev) => {
      const updated = { ...prev };
      const val = Number(value) || 0;

      if (field === "quantityServed") {
        updated.items[index].quantityServed = val;
        updated.items[index].quantityUnserved =
          updated.items[index].quantityOrdered - val;
      } else if (field === "quantityUnserved") {
        updated.items[index].quantityUnserved = val;
        updated.items[index].quantityServed =
          updated.items[index].quantityOrdered - val;
      }

      return updated;
    });
  };

  const handleApprove = async (row) => {
    try {
      Swal.fire({
        title: "Approving order...",
        text: "Please wait while we check stock and process your request.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // -------------------------------
      // 0) Validate stock availability
      // -------------------------------
      const itemCodes = row.orderedItems.map((item) => item.itemCode);
      const stockResponse = await axios.get(`${API_URL}/items/check-stocks`, {
        params: { itemCodes: itemCodes.join(",") },
      });

      const stocks = stockResponse.data.stocks || {};
      console.log("[handleApprove] Current stock levels:", stocks);

      const insufficientItems = row.orderedItems.filter((item) => {
        const currentStock = Number(stocks[item.itemCode]) || 0;
        return currentStock < item.quantityServed;
      });

      if (insufficientItems.length > 0) {
        const message = insufficientItems
          .map(
            (item) =>
              `<b>${item.itemName}</b> (Req: ${item.quantityServed}, Stock: ${
                stocks[item.itemCode] || 0
              })`
          )
          .join("\n");

        Swal.fire({
          icon: "warning",
          title: "Insufficient Stock",
          html: message,
        });
        return;
      }

      // -------------------------------
      // 1) Proceed to Approve
      // -------------------------------
      const payload = {
        orderIds: [row.orderId],
      };

      console.log(
        "[handleApprove] Sending payload to backend:",
        JSON.stringify(payload, null, 2)
      );

      const response = await axios.post(
        `${API_URL}/orders/serve-approved`,
        payload
      );

      console.log("[handleApprove] Backend response:", response.data);

      Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Order has been approved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchOrders();
    } catch (error) {
      console.error("[handleApprove] Error approving orders:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to approve orders. Please try again.",
      });
    }
  };

  const handleReject = async (row) => {
    Swal.fire({
      title: "Rejecting orders...",
      text: "Please wait while we process your request.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      console.log("Reject payload:", { orderIds: row.orderId });

      await axios.post(`${API_URL}/orders/reject`, {
        orderIds: [row.orderId],
      });
      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Rejected!",
        text: "Selected orders have been rejected successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchOrders(); // refresh after reject
    } catch (error) {
      console.error("Error rejecting orders:", error);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to reject orders. Please try again.",
      });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        {/* Search input field */}
        <div className="position-relative w-25 my-3">
          <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input
            type="text"
            placeholder="Search inventory"
            value={searchTerm}
            onChange={handleSearch}
            className="form-control ps-5 border-2 rounded-3"
          />
        </div>

        <Link to="/create-order">
          <button
            type="button"
            className="btn me-5"
            style={{ backgroundColor: "#246c9d", color: "white" }}
          >
            + Add Order
          </button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        paginationPerPage={20}
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="450px"
        onRowClicked={handleRowClick}
        className="custom-data-table"
      />

      {showRowModal && selectedRow && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div
              className="modal-dialog modal-xl modal-dialog-centered"
              role="document"
              style={{ maxHeight: "90vh" }}
            >
              <div
                className="modal-content"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  className="modal-header d-flex flex-column align-items-start text-white position-relative overflow-hidden"
                  style={{
                    background: "#246c9d 100%",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    cursor: "move", // for draggable
                  }}
                >
                  <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                    <p className="mb-2 opacity-75" style={{ fontSize: "20px" }}>
                      {selectedRow.orderId}
                    </p>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
                      onClick={() => setShowRowModal(false)}
                    ></button>
                  </div>

                  <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                    {/*
                    <h5 className="mb-0">Order ID: {selectedRow.orderId}</h5>
                    */}
                    <h5 className="mb-0">
                      Customer: {selectedRow.customerName}
                    </h5>

                    <div className="d-flex gap-2">
                      {selectedRow?.status?.trim().toLowerCase() ===
                        "pending" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          style={{ color: "#246c9d" }}
                          onClick={() => handleEdit(selectedRow)}
                        >
                          Edit
                        </button>
                      )}
                      {selectedRow?.status?.trim().toLowerCase() !==
                        "served" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          style={{ color: "#246c9d" }}
                          onClick={() => handlePrint(true)}
                        >
                          Print Preview
                        </button>
                      )}
                      {selectedRow && (
                        <>
                          {selectedRow.status?.trim().toLowerCase() ===
                            "pending" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-light"
                              style={{ color: "#246c9d" }}
                              onClick={() => {
                                setShowRowModal(false);
                                handleServe(selectedRow);
                              }}
                            >
                              Serve
                            </button>
                          )}
                          {roleApprove.toLowerCase() === "admin" &&
                            selectedRow.status?.trim().toLowerCase() ===
                              "for request" && (
                              <button
                                type="button"
                                className="btn btn-sm btn-light"
                                style={{
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  border: "none",
                                }}
                                onClick={() => {
                                  setShowRowModal(false);
                                  handleApprove(selectedRow);
                                }}
                              >
                                Approve
                              </button>
                            )}
                          {roleApprove.toLowerCase() === "admin" &&
                            selectedRow.status?.trim().toLowerCase() ===
                              "for request" && (
                              <button
                                type="button"
                                className="btn btn-sm btn-light"
                                style={{
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                }}
                                onClick={() => {
                                  setShowRowModal(false);
                                  handleReject(selectedRow);
                                }}
                              >
                                Reject
                              </button>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-body">
                  <div
                    className=" rounded-3"
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <ul className="list-unstyled">
                      {selectedRow.orderedItems.map((item, index) => (
                        <>
                          <li key={index}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              {/* Image and Product Info */}
                              <div className="d-flex flex-column">
                                <span className="fw-semibold">
                                  {item.itemName}
                                </span>

                                <small className="text-muted">
                                  Price: ₱
                                  {item.price.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}{" "}
                                  | Qty: {item.quantity}
                                  {selectedRow.status === "For Request" && (
                                    <>
                                      {" "}
                                      (
                                      <span className="text-success">
                                        Served: {item.quantityServed ?? 0}
                                      </span>{" "}
                                      |{" "}
                                      <span className="text-danger">
                                        Unserved:{" "}
                                        {(item.quantity ?? 0) -
                                          (item.quantityServed ?? 0)}
                                      </span>
                                      )
                                    </>
                                  )}
                                </small>

                                {item.discPercent > 0 && (
                                  <small className="text-danger">
                                    Discount: {item.discPercent}% ( ₱
                                    {(
                                      (parseFloat(
                                        item.price?.[item.selectedMarkup]
                                      ) || 0) *
                                      (parseInt(item.quantity) || 0) *
                                      (item.discPercent / 100)
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                    )
                                  </small>
                                )}
                              </div>

                              {/* Price */}
                              <div className="text-end d-flex flex-column">
                                <span className="fw-semibold">
                                  ₱
                                  {(item.price * item.quantity).toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                          </li>
                          <hr className="my-0 border-secondary" />
                        </>
                      ))}
                    </ul>
                  </div>

                  {/* Total Row */}
                  <div className="d-flex justify-content-between align-items-center pt-3 ms-3">
                    <span className="h5 fw-semibold ">Total</span>
                    <span className="fw-bold h5">
                      ₱
                      {selectedRow.totalPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Modal Footer */}
                {/*
                <div className="modal-footer d-flex justify-content-between align-items-end px-3 ">
                  <div>
                    <p className="fw-bold mb-1" style={{ color: "#246c9d" }}>
                      {selectedRow.customerName}
                    </p>
                    <p className="mb-0 small">{selectedRow.customerAddress}</p>
                    <p className="mb-0 small">{selectedRow.customerNumber}</p>
                  </div>
                  <p className="text-muted small mb-0">
                    {new Date(selectedRow.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                */}
              </div>
            </div>
          </div>
        </>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedRow && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-xl" role="document">
              <div className="modal-content">
                {/* Header */}
                <div
                  className="modal-header d-flex flex-column align-items-start text-white position-relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #246c9d 0%, #1e3c72 100%)",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    cursor: "move", // draggable handle
                  }}
                >
                  <div className="w-100 d-flex justify-content-between align-items-center ">
                    <p className="mb-2 opacity-75" style={{ fontSize: "12px" }}>
                      Sales &gt; Order &gt; {selectedRow.orderId}
                    </p>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
                      onClick={() => setShowEditModal(false)}
                    ></button>
                  </div>

                  <div className="w-100 d-flex justify-content-between align-items-center ">
                    <h5 className="mb-0">Edit Order {selectedRow.orderId}</h5>
                  </div>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <h6 className="mb-1">Customer Details</h6>
                  <form>
                    <div className="row mb-2">
                      {/* Name */}
                      <div className="col-md-6 position-relative">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={customerQuery}
                          onChange={handleCustomerNameChange}
                          onBlur={() =>
                            setTimeout(() => setCustomerSuggestions([]), 150)
                          }
                          placeholder="Customer Name"
                        />

                        {customerSuggestions.length > 0 && (
                          <ul
                            className="list-group position-absolute w-100"
                            style={{ zIndex: 1000 }}
                          >
                            {customerSuggestions.map((c) => (
                              <li
                                key={c.customerID}
                                className="list-group-item list-group-item-action"
                                onMouseDown={() => handleSelectCustomer(c)}
                              >
                                {c.customerName}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Address */}
                      <div className="col-md-6">
                        <label className="form-label">Address</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editableRow.customerAddress}
                          onChange={handleInputChange}
                          placeholder="Customer Address"
                        />
                      </div>
                    </div>

                    <hr />
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Ordered Items</h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={addItem}
                        disabled={
                          editableRow?.orderedItems?.length >= MAX_ITEMS
                        }
                      >
                        + Add Item
                      </button>
                    </div>
                    {itemLimitWarning && (
                      <div className="alert alert-warning py-2 mb-2">
                        Maximum of {MAX_ITEMS} items only.
                      </div>
                    )}
                    {/* Items List */}
                    <div
                      className="rounded-3"
                      style={{ maxHeight: "250px", overflowY: "auto" }}
                    >
                      {editableRow?.orderedItems.map((item, index) => (
                        <div
                          key={index}
                          className="position-relative d-flex gap-2 mb-2 align-items-center"
                        >
                          {/* Item Search */}
                          <div className="flex-grow-1 position-relative">
                            <input
                              ref={(el) => (inputRefs.current[index] = el)}
                              type="text"
                              value={
                                activeIndex === index ? query : item.itemName
                              }
                              onChange={(e) =>
                                handleSearchChange(index, e.target.value)
                              }
                              className="form-control"
                              placeholder="Search item..."
                            />

                            {activeIndex === index &&
                              suggestions.length > 0 && (
                                <ul
                                  style={{
                                    position: "fixed", // makes it float above all content
                                    top:
                                      inputRefs.current[
                                        index
                                      ]?.getBoundingClientRect().bottom +
                                      window.scrollY,
                                    left: inputRefs.current[
                                      index
                                    ]?.getBoundingClientRect().left,
                                    width:
                                      inputRefs.current[index]?.offsetWidth,
                                    backgroundColor: "#fff",
                                    border: "1px solid #ccc",
                                    borderRadius: "0.25rem",
                                    listStyle: "none",
                                    margin: 0,
                                    padding: 0,
                                    zIndex: 2000,
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  {suggestions.map((s, i) => (
                                    <li
                                      key={i}
                                      onClick={() =>
                                        handleSelectSuggestion(index, s)
                                      }
                                      style={{
                                        padding: "8px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                        background: "white",
                                      }}
                                      onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                          "#f8f9fa")
                                      }
                                      onMouseLeave={(e) =>
                                        (e.currentTarget.style.background =
                                          "white")
                                      }
                                    >
                                      <strong>{s.itemName}</strong> <br />
                                      <small className="text-muted">
                                        Stock: {s.stock}
                                      </small>
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </div>

                          {/* Quantity */}
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", e.target.value)
                            }
                            className="form-control"
                            style={{ width: "80px" }}
                          />

                          {/* Price options */}
                          {item.customPriceEnabled ? (
                            <div
                              className="input-group"
                              style={{ width: "120px" }}
                            >
                              <input
                                type="number"
                                className="form-control text-center"
                                value={item.customPrice || ""}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "customPrice",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="Enter price"
                                style={{ fontSize: "14px" }}
                              />

                              <button
                                type="button"
                                className="btn border-top border-bottom border-end border-0 bg-white"
                                title="Back to list"
                                onClick={() => {
                                  updateItem(
                                    index,
                                    "customPriceEnabled",
                                    false
                                  );
                                  updateItem(index, "customPrice", "");
                                }}
                              >
                                <IoChevronDown />
                              </button>
                            </div>
                          ) : (
                            <select
                              className="form-select"
                              style={{ width: "120px" }}
                              value={
                                item.customPriceEnabled
                                  ? "custom"
                                  : item.price ?? ""
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "custom") {
                                  updateItem(index, "customPriceEnabled", true);
                                  updateItem(index, "customPrice", "");
                                } else {
                                  updateItem(index, "price", Number(val));
                                }
                              }}
                            >
                              {item.availablePrices?.map((p, i) => (
                                <option key={i} value={p}>
                                  ₱{Number(p).toLocaleString()}
                                </option>
                              ))}
                              <option value="custom">Custom...</option>
                            </select>
                          )}

                          {/* Item total */}
                          <div
                            className="text-end fw-semibold"
                            style={{ width: "100px" }}
                          >
                            {(() => {
                              const finalPrice = item.customPriceEnabled
                                ? Number(item.customPrice)
                                : Number(item.price);

                              return `₱${(
                                finalPrice * item.quantity
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}`;
                            })()}
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              backgroundColor: "#B64345",
                              color: "white",
                            }}
                            onClick={() => removeItem(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </form>
                </div>

                {/* ✅ Total Section */}
                <div
                  className="d-flex justify-content-between align-items-center px-4 py-3 border-top mt-3"
                  style={{
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <span className="fw-semibold fs-5">Total</span>
                  <span className="fw-bold fs-5">
                    {editableRow?.orderedItems
                      ?.reduce((sum, item) => {
                        const finalPrice = item.customPriceEnabled
                          ? Number(item.customPrice)
                          : Number(item.price);

                        return sum + finalPrice * (Number(item.quantity) || 0);
                      }, 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Footer */}
                <div className="modal-footer d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    className="btn ms-auto"
                    style={{ backgroundColor: "#B64345", color: "white" }}
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ backgroundColor: "#246c9d", color: "white" }}
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SERVE MODAL */}
      {showServeModal && selectedRow && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>

          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div
              className="modal-dialog modal-lg modal-dialog-centered"
              role="document"
            >
              <div className="modal-content">
                {/* Header */}
                <div
                  className="modal-header d-flex flex-column align-items-start text-white position-relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #246c9d 0%, #1e3c72 100%)",
                    borderRadius: "0.5rem 0.5rem 0 0",
                  }}
                >
                  <div className="w-100 d-flex justify-content-between align-items-center">
                    <p className="mb-2 opacity-75" style={{ fontSize: "12px" }}>
                      Order &gt; Serve &gt; {selectedRow.orderId}
                    </p>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
                      onClick={() => setShowServeModal(false)}
                    ></button>
                  </div>

                  <div className="w-100 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      Serve Items for Order {selectedRow.orderId}
                    </h5>
                  </div>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <h6 className="mb-3">Order Items</h6>

                  {/* Header Labels */}
                  <div className="d-flex gap-2 align-items-center mb-2 pb-2 border-bottom me-4">
                    <div
                      className="flex-grow-1 fw-semibold text-muted"
                      style={{ fontSize: "14px" }}
                    >
                      Item Name
                    </div>
                    <div
                      className="text-center fw-semibold text-muted"
                      style={{ width: "100px", fontSize: "14px" }}
                    >
                      Served
                    </div>
                    <div
                      className="text-center fw-semibold text-muted"
                      style={{ width: "100px", fontSize: "14px" }}
                    >
                      Unserved
                    </div>
                    <div
                      className="text-center fw-semibold text-muted"
                      style={{ width: "80px", fontSize: "14px" }}
                    >
                      Ordered
                    </div>
                  </div>

                  {/* Scrollable Items Container */}
                  <div
                    className="rounded-3"
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    <ul className="list-unstyled">
                      {serveData.items.map((item, index) => (
                        <li
                          key={index}
                          className="d-flex flex-column"
                          style={{ gap: "5px" }}
                        >
                          <div
                            className="d-flex justify-content-between align-items-center"
                            style={{ gap: "10px" }}
                          >
                            {/* Item Name */}
                            <div className="flex-grow-1 d-flex flex-column">
                              <span className="fw-medium">{item.itemName}</span>
                              <small
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "700",
                                  color:
                                    item.stock < 5
                                      ? "#B64345"
                                      : item.stock >= 5 && item.stock < 20
                                      ? "#F8B13D"
                                      : "#ACACAC",
                                }}
                              >
                                In stock: {item.stock}
                              </small>
                            </div>

                            {/* Served */}
                            <div className="d-flex align-items-center">
                              <input
                                type="number"
                                min={0}
                                max={item.quantityOrdered}
                                value={item.quantityServed}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "") {
                                    updateServeQuantity(
                                      index,
                                      "quantityServed",
                                      ""
                                    );
                                    return;
                                  }

                                  const parsed = Number(raw);
                                  if (Number.isNaN(parsed)) return;
                                  const clamped = Math.max(
                                    0,
                                    Math.min(parsed, item.quantityOrdered)
                                  );
                                  updateServeQuantity(
                                    index,
                                    "quantityServed",
                                    clamped
                                  );
                                }}
                                className="form-control text-center"
                                placeholder="0"
                                style={{ width: "100px" }}
                              />
                            </div>

                            {/* Unserved */}
                            <div className="d-flex align-items-center">
                              <input
                                type="number"
                                min={0}
                                max={item.quantityOrdered}
                                value={item.quantityUnserved}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "") {
                                    updateServeQuantity(
                                      index,
                                      "quantityServed",
                                      ""
                                    );
                                    return;
                                  }

                                  const parsed = Number(raw);
                                  if (Number.isNaN(parsed)) return;
                                  const clamped = Math.max(
                                    0,
                                    Math.min(parsed, item.quantityOrdered)
                                  );
                                  updateServeQuantity(
                                    index,
                                    "quantityServed",
                                    clamped
                                  );
                                }}
                                className="form-control text-center"
                                placeholder="0"
                                style={{ width: "100px" }}
                              />
                            </div>

                            {/* Ordered */}
                            <div
                              className="d-flex align-items-center justify-content-center fw-semibold"
                              style={{ width: "80px" }}
                            >
                              {item.quantityOrdered}
                            </div>
                          </div>

                          {/* Divider line between items, hide for last item */}
                          {index < serveData.items.length - 1 && (
                            <hr className="my-1 border-secondary w-100" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    className="btn ms-auto"
                    onClick={() => setShowServeModal(false)}
                    style={{ backgroundColor: "#B64345", color: "white" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ backgroundColor: "#246c9d", color: "white" }}
                    onClick={async () => {
                      try {
                        // ✅ Validate stock before submit
                        for (const item of serveData.items) {
                          const served = Number(item.quantityServed) || 0;
                          const stock = Number(item.stock) || 0;

                          if (served > stock) {
                            Swal.fire({
                              icon: "error",
                              title: "Insufficient Stock",
                              html: `Item <b>${item.itemName}</b> only has <b>${stock}</b> in stock. You tried to serve <b>${served}</b>.`,
                            });
                            return; // Stop submit
                          }
                        }

                        // ✅ If validation passed, continue serving
                        console.log("Serve button clicked");
                        console.log("serveData being sent:", serveData);

                        const user = JSON.parse(localStorage.getItem("user"));
                        const role = user?.role || "";

                        const cleanPayload = {
                          ...serveData,
                          items: serveData.items.map(
                            ({ stock, ...rest }) => rest
                          ),
                        };

                        await axios.patch(
                          `${API_URL}/orders/${selectedRow.orderId}/serve`,
                          cleanPayload,
                          { params: { role } }
                        );

                        Swal.fire({
                          icon: "success",
                          title:
                            role.toLowerCase() === "admin"
                              ? "Served"
                              : "Requested",
                          text:
                            role.toLowerCase() === "admin"
                              ? "Serve data submitted successfully"
                              : "Serve data requested successfully",
                          timer: 2000,
                          showConfirmButton: false,
                        });

                        fetchOrders();
                        setShowServeModal(false);
                      } catch (err) {
                        console.error(err);
                        Swal.fire({
                          icon: "error",
                          title: "Error",
                          text: "Failed to submit serve data",
                        });
                      }
                    }}
                  >
                    Serve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default OrdersTable;
