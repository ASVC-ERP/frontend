import { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { IoIosSearch } from "react-icons/io";
import axios from "axios";
import Swal from "sweetalert2";

// Define table columns
const columns = [
  {
    name: "Order ID",
    selector: (row) => row.orderId,
    sortable: true,
    grow: 0,
    minWidth: "130px",
  },
  {
    name: "Date",
    selector: (row) =>
      new Date(row.date).toLocaleDateString("en-US", {
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
    selector: (row) => row.customerName,
    sortable: true,
    grow: 3,
    minWidth: "200px",
    wrap: true,
  },
  {
    name: "Address",
    selector: (row) => row.customerAddress,
    sortable: true,
    grow: 3,
    minWidth: "250px",
    wrap: true,
  },
  {
    name: "PIC",
    selector: (row) => row.salesAgent,
    sortable: true,
    grow: 0,
    width: "150px",
  },
  {
    name: "Status",
    sortable: true,
    grow: 0,
    minWidth: "150px",
    cell: (row) => (
      <span
        className={`badge ${
          row.status === "Served"
            ? "bg-success"
            : row.status === "Pending"
            ? "bg-warning text-dark"
            : row.status === "Dropped"
            ? "bg-danger"
            : "bg-secondary"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

const API_URL = import.meta.env.VITE_API_URL;

// Define table data
function OrdersTable({ orders, setOrders }) {
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

  const [showServeModal, setShowServeModal] = useState(false);
  const [serveData, setServeData] = useState([]);

  const inputRefs = useRef([]);

  // Function to fetch orders
  const fetchOrders = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const endpoint =
      user.role === "agent"
        ? `${API_URL}/orders?agent=${encodeURIComponent(
            user.firstName + " " + user.lastName
          )}`
        : `${API_URL}/orders`;

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

        console.log("🛒 Ordered Item:", ordered.itemName);
        if (match) {
          console.log("✅ Match Found →", match.itemName);
          console.log("💰 Available Prices:", match.prices);
        } else {
          console.warn("⚠️ No Match Found in Inventory for:", ordered.itemName);
        }

        return {
          ...ordered,
          price: Number(ordered.price) || 0,
          availablePrices: match ? match.prices : [],
        };
      });

      setEditableRow({ ...row, orderedItems: updatedOrderedItems });
      setSelectedRow(row);
      setShowEditModal(true);
    } catch (err) {
      console.error("Error loading prices:", err);
    }
  };

  const handleRowClick = (row) => {
    console.log("Row clicked:", row);
    setSelectedRow(row);

    setEditableRow({
      ...row,
      orderedItems: Array.isArray(row.orderedItems)
        ? [...row.orderedItems]
        : [],
    });

    setIsEditing(false);
    setShowRowModal(true);
  };

  // Handle top-level inputs (customerName, status, etc.)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableRow((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new item row
  const addItem = () => {
    setEditableRow((prev) => {
      const newItems = [
        ...(prev.orderedItems || []),
        { itemName: "", quantity: 1 },
      ];
      setActiveIndex(newItems.length - 1); // focus last added item
      return { ...prev, orderedItems: newItems };
    });
    setQuery("");
  };

  // Remove an item by index
  const removeItem = (index) => {
    setEditableRow((prev) => ({
      ...prev,
      orderedItems: prev.orderedItems.filter((_, i) => i !== index),
    }));
  };

  // Update item field
  const updateItem = (index, field, value) => {
    setEditableRow((prev) => {
      const items = [...prev.orderedItems];

      if (field === "quantity" || field === "price") {
        items[index] = { ...items[index], [field]: Number(value) };
      } else {
        items[index] = { ...items[index], [field]: value };
      }
      return { ...prev, orderedItems: items };
    });
  };

  const handleSave = async () => {
    try {
      // 🔹 Recalculate total price from ordered items
      const recalculatedTotal = (editableRow.orderedItems || []).reduce(
        (sum, item) =>
          sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
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
          price: it.price || 0,
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

  const handleServe = (row) => {
    setSelectedRow(row);

    // Prepare the object exactly matching ServeOrderDto
    const payload = {
      date: row.date,
      customerName: row.customerName,
      customerAddress: row.customerAddress,
      customerNumber: row.customerNumber,
      customerTIN: row.customerTIN || "", // <-- added
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
      const payload = {
        id: [row.orderId], // wrap in array to match backend
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
        text: "Selected orders have been approved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setSelectedOrders([]);
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
                      {selectedRow?.status?.trim().toLowerCase() !==
                        "served" && (
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
                          Print
                        </button>
                      )}
                      {selectedRow?.status?.trim().toLowerCase() !==
                        "served" && (
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
                
                <div
                  className="modal-footer d-flex justify-content-end"
                  style={{
                    borderTop: "1px solid #dee2e6",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  {selectedRow?.status?.trim().toLowerCase() !== "served" && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{
                        backgroundColor: "#0CA678",
                        border: "none"
                      }}
                      onClick={() => handleApprove(selectedRow)} // optional function
                    >
                      Approve
                    </button>
                  )}
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
                      <div className="col-md-6">
                        <label htmlFor="customerName" className="form-label">
                          Name
                        </label>
                        <input
                          type="text"
                          id="customerName"
                          name="customerName"
                          value={editableRow.customerName}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Customer Name"
                        />
                      </div>

                      {/* Address */}
                      <div className="col-md-6">
                        <label htmlFor="customerAddress" className="form-label">
                          Address
                        </label>
                        <input
                          type="text"
                          id="customerAddress"
                          name="customerAddress"
                          value={editableRow.customerAddress}
                          onChange={handleInputChange}
                          className="form-control"
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
                      >
                        + Add Item
                      </button>
                    </div>{" "}
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
                          <select
                            value={Number(item.price) || 0}
                            onChange={(e) =>
                              updateItem(index, "price", Number(e.target.value))
                            }
                            className="form-select"
                            style={{ width: "120px" }}
                          >
                            {item.availablePrices?.map((p, i) => (
                              <option key={i} value={p}>
                                ₱{Number(p).toLocaleString()}
                              </option>
                            ))}
                          </select>

                          {/* Item total */}
                          <div
                            className="text-end fw-semibold"
                            style={{ width: "100px" }}
                          >
                            ₱
                            {(item.price * item.quantity).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
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
                    ₱
                    {editableRow?.orderedItems
                      ?.reduce(
                        (sum, item) =>
                          sum +
                          (Number(item.price) || 0) *
                            (Number(item.quantity) || 0),
                        0
                      )
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
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
            <div className="modal-dialog modal-lg" role="document">
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
                      Kitchen &gt; Serve &gt; {selectedRow.orderId}
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
                            <div className="flex-grow-1 d-flex align-items-center">
                              <span className="fw-medium">{item.itemName}</span>
                            </div>

                            {/* Served */}
                            <div className="d-flex align-items-center">
                              <input
                                type="number"
                                min={0}
                                max={item.quantityOrdered}
                                value={item.quantityServed}
                                onChange={(e) =>
                                  updateServeQuantity(
                                    index,
                                    "quantityServed",
                                    e.target.value
                                  )
                                }
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
                                onChange={(e) =>
                                  updateServeQuantity(
                                    index,
                                    "quantityUnserved",
                                    e.target.value
                                  )
                                }
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
                        console.log("Serve button clicked"); // <--- log immediately on click
                        console.log("serveData being sent:", serveData); // <--- log payload
                        const user = JSON.parse(localStorage.getItem("user"));
                        const role = user?.role || "";
                        await axios.patch(
                          `${API_URL}/orders/${selectedRow.orderId}/serve`,
                          serveData,
                          {
                            params: { role },
                          }
                        );
                        if (role.toLowerCase() === "admin") {
                          Swal.fire({
                            icon: "success",
                            title: "Served",
                            text: "Serve data submitted successfully",
                            timer: 2000,
                            showConfirmButton: false,
                          });

                          fetchOrders();
                        } else {
                          Swal.fire({
                            icon: "success",
                            title: "Requested",
                            text: "Serve data Requested successfully",
                            timer: 2000,
                            showConfirmButton: false,
                          });
                          fetchOrders();
                        }

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
