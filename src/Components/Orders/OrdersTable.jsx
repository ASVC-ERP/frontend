import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { IoIosSearch } from "react-icons/io";
import defaultPic from "../../assets/defaultPic.jpg";
import axios from 'axios';
import Swal from "sweetalert2";


// Define table columns
const columns = [
  { name: "Order ID", selector: (row) => row.orderId, sortable: true },
  { name: "Date", selector: (row) => row.date, sortable: true },
  {
    name: "Customer Name",
    selector: (row) => row.customerName,
    sortable: true,
  },
  {
    name: "Customer Address",
    selector: (row) => row.customerAddress,
    sortable: true,
  },
  { name: "Sales Agent", selector: (row) => row.salesAgent, sortable: true },
  { name: "Status",
    selector: (row) => row.status,
    sortable: true,
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
    )},
];

// Define table data
function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedRow, setSelectedRow] = useState(null);
  const [editableRow, setEditableRow] = useState(null);

  const [showRowModal, setShowRowModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const [showServeModal, setShowServeModal] = useState(false);
  const [serveData, setServeData] = useState([]);


  useEffect(() => {
    axios.get("http://localhost:3000/orders")
      .then((res) => {
        setOrders(res.data);
        setFilteredData(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
      });
  }, []);

// delivery receipt generation
/*
  const handleCreateDeliveryReceipt = (withInvoice) => {
    const url = withInvoice
      ? "http://localhost:3000/delivery-receipts/invoice"
      : "http://localhost:3000/delivery-receipts/delivery-receipts-no-invoice";

    // Open PDF in new tab
    window.open(`${url}?orderId=${selectedRow.orderId}`, "_blank");

    setShowRequestModal(false);
  };
*/

  // Handle search input change
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = Object.values(orders).filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const handleRowClick = (row) => {
    console.log("Row clicked:", row);
    setSelectedRow(row);

    setEditableRow({
      ...row,
      orderedItems: Array.isArray(row.orderedItems) ? [...row.orderedItems] : [],
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
    setEditableRow(prev => {
      const newItems = [...(prev.orderedItems || []), { itemName: "", quantity: 1 }];
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
      const payload = {
        orderId: editableRow.orderId,
        date: editableRow.date,
        customerName: editableRow.customerName,
        customerAddress: editableRow.customerAddress,
        customerNumber: editableRow.customerNumber,
        status: editableRow.status,
        salesAgent: editableRow.salesAgent,
        orderedItems: (editableRow.orderedItems || []).map(it => ({
          itemName: it.itemName,
          quantity: Number(it.quantity) || 0,
          price: it.price || 0,
        })),
        totalPrice: editableRow.totalPrice || 0,
      };

      console.log("Payload being sent:", payload);

      await axios.patch(`http://localhost:3000/orders/${editableRow.orderId}`, payload);
      setOrders(prev => prev.map(o => o.orderId === editableRow.orderId ? { ...editableRow } : o));
      setFilteredData(prev => prev.map(o => o.orderId === editableRow.orderId ? { ...editableRow } : o));
      setSelectedRow({ ...editableRow });
      setIsEditing(false);
      Swal.fire({
        icon: "success",
        title: "Order Updated",
        text: `Order ${editableRow.orderId} was updated successfully!`,
        timer: 2000,
        showConfirmButton: false
      });
      setShowEditModal(false);
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
      const res = await axios.get(`http://localhost:3000/items?search=${value}`);
      
      // Map prices into array for dropdown
      const itemsWithPrices = res.data.map(item => ({
        ...item,
        prices: [item.price1, item.price2, item.price3, item.price4].filter(p => p != null)
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
        stock: item.stock,
        quantity: 1,
        availablePrices: [priceObj.price1, priceObj.price2, priceObj.price3, priceObj.price4].filter(p => p != null),
        price: priceObj.price1
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

    try {
      const response = await axios.post(
        'http://localhost:3000/packing-list/invoice',
        selectedRow,
        { responseType: 'blob' } // important to handle PDF
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      Swal.fire({
        icon: 'error',
        title: 'Print Failed',
        text: 'Failed to generate PDF. See console for details.',
      });
    }
  };

  const handleServe = (row) => {
    setSelectedRow(row);
    setServeData(
      row.orderedItems.map(item => ({
        itemName: item.itemName,
        quantityOrdered: item.quantity,
        quantityServed: 0,
        quantityUnserved: item.quantity,
      }))
    );
    setShowServeModal(true);
  };

  const updateServeQuantity = (index, field, value) => {
    setServeData(prev => {
      const updated = [...prev];
      const val = Number(value) || 0;

      if (field === 'quantityServed') {
        updated[index].quantityServed = val;
        updated[index].quantityUnserved = updated[index].quantityOrdered - val;
      } else if (field === 'quantityUnserved') {
        updated[index].quantityUnserved = val;
        updated[index].quantityServed = updated[index].quantityOrdered - val;
      }

      return updated;
    });
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
            style={{ backgroundColor: "#0C1D61", color: "white" }}
          >
            + Add Order
          </button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="500px"
        onRowClicked={handleRowClick}
        className="custom-data-table"
      />

      {showRowModal && selectedRow && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header d-flex flex-column align-items-start">
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <p
                    className="mb-2"
                    style={{ color: "#05050599", fontSize: "12px" }}
                  >
                    Sales &gt; Order &gt; {selectedRow.orderId}
                  </p>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowRowModal(false)}
                  ></button>
                </div>
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0" style={{ color: "#0C1D61" }}>
                    Order ID: {selectedRow.orderId}
                  </h5>
                  <div className="d-flex gap-2">
{/*
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: "#0C1D61", color: "white" }}
                      onClick={handleRequestInvoice}
                    >
                      Request Invoice
                    </button>
*/}
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: "#0C1D61", color: "white" }}
                      onClick={() => {
                        setShowRowModal(false);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: "#0C1D61", color: "white" }}
                      onClick={() => handlePrint(true)}
                    >
                      Print
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ backgroundColor: "#0C1D61", color: "white" }}
                      onClick={() => {
                        setShowRowModal(false);
                        handleServe(selectedRow);
                      }}
                    >
                      Serve
                </button>
                  </div>
                </div>
              </div>
              <div className="modal-body">
                <div
                  className=" rounded-3"
                  style={{ maxHeight: "250px", overflowY: "auto" }}
                >
                  <ul className="list-unstyled">
                    {selectedRow.orderedItems.map((item, index) => (
                      <li key={index}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          {/* Image and Product Info */}
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={defaultPic}
                              alt="Product"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">
                                {item.itemName}
                              </span>
                            </div>
                          </div>

                          {/* Price and Qty */}
                          <div className="text-end d-flex flex-column">
                            <span className="fw-semibold">
                              ₱
                              {(
                                item.price * item.quantity
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <small className="text-muted">
                              Qty: {item.quantity}
                            </small>
                          </div>
                        </div>
                      </li>
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
              <div className="modal-footer d-flex justify-content-between align-items-end px-3 ">
                <div>
                  <p className="fw-bold mb-1" style={{ color: "#0C1D61" }}>
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
            </div>
          </div>
        </div>
      )}

      {/* REQUEST INVOICE MODAL */}
      {showRequestModal && selectedRow && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header d-flex flex-column align-items-start">
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <p
                    className="mb-2"
                    style={{ color: "#05050599", fontSize: "12px" }}
                  >
                    Sales &gt; Order &gt; {selectedRow.orderId}
                  </p>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowRequestModal(false)}
                  ></button>
                </div>
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0" style={{ color: "#0C1D61" }}>
                    Order ID: {selectedRow.orderId}
                  </h5>
                </div>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <p className="h5">
                  {" "}
                  What type of document would you like to create?{" "}
                </p>

                <div className="d-flex justify-content-center gap-3 mt-4 mb-3">
                  <button
                    className="btn"
                    style={{ backgroundColor: "#0C1D61", color: "white" }}
                    onClick={() => handleCreateDeliveryReceipt(true)}
                  >
                    Delivery Receipt with Invoice
                  </button>
                  <button
                    className="btn"
                    style={{ backgroundColor: "#0C1D61", color: "white" }}
                    onClick={() => handleCreateDeliveryReceipt(false)}
                  >
                    Delivery Receipt
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer d-flex justify-content-between align-items-end px-3 ">
                <div>
                  <p className="fw-bold mb-1" style={{ color: "#0C1D61" }}>
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
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedRow && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="mb-0">Edit Order {selectedRow.orderId}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <h6 className="mb-0">Customer Details</h6>
                <form>
                  <div className="mb-2">
                    <input
                      type="text"
                      name="customerName"
                      value={editableRow.customerName}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                    <input
                      type="text"
                      name="customerAddress"
                      value={editableRow.customerAddress}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>

                  <hr />
                  <h6>Ordered Items</h6>
                  {editableRow?.orderedItems.map((item, index) => (
                    <div key={index} className="position-relative d-flex gap-2 mb-2 align-items-center">
                      <div className="flex-grow-1 position-relative">
                        <input
                          type="text"
                          value={activeIndex === index ? query : item.itemName}
                          onChange={(e) => handleSearchChange(index, e.target.value)}
                          className="form-control"
                          placeholder="Search item..."
                        />

                        {/* Suggestions dropdown */}
                        {activeIndex === index && suggestions.length > 0 && (
                          <ul
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              backgroundColor: "#fff",
                              border: "1px solid #ccc",
                              listStyle: "none",
                              margin: 0,
                              padding: 0,
                              zIndex: 1000,
                              maxHeight: "200px",
                              overflowY: "auto",
                            }}
                          >
                            {suggestions.map((s, i) => (
                              <li
                                key={i}
                                onClick={() => handleSelectSuggestion(index, s)}
                                style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                              >
                                <strong>{s.itemName}</strong> <br />
                                Stock: {s.stock}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Quantity */}
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(index, "quantity", e.target.value)}
                        className="form-control"
                        style={{ width: "80px" }}
                      />

                      <select
                        value={item.price || 0}
                        onChange={e => updateItem(index, "price", e.target.value)}
                        className="form-select"
                        style={{ width: "120px" }}
                      >
                        {item.availablePrices?.map((p, i) => (
                          <option key={i} value={p}>₱{p.toLocaleString()}</option>
                        ))}
                      </select>

                      {/* Total for this item */}
                      <div className="text-end fw-semibold" style={{ width: "100px" }}>
                        ₱{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {/* Add Item Button */}
                  <button
                    type="button"
                    className="btn btn-sm btn-success mt-2"
                    onClick={addItem}
                  >
                    + Add Item
                  </button>
                </form>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SERVE MODAL */}
      {showServeModal && selectedRow && (
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="mb-0">Serve Items for Order {selectedRow.orderId}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowServeModal(false)}
              ></button>
            </div>

            <div className="modal-body">
              {serveData.map((item, index) => (
                <div key={index} className="d-flex gap-2 align-items-center mb-2">
                  <div className="flex-grow-1">{item.itemName}</div>
                  <div>
                    <input
                      type="number"
                      min={0}
                      max={item.quantityOrdered}
                      value={item.quantityServed}
                      onChange={e => updateServeQuantity(index, 'quantityServed', e.target.value)}
                      className="form-control"
                      placeholder="Served"
                      style={{ width: "100px" }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min={0}
                      max={item.quantityOrdered}
                      value={item.quantityUnserved}
                      onChange={e => updateServeQuantity(index, 'quantityUnserved', e.target.value)}
                      className="form-control"
                      placeholder="Unserved"
                      style={{ width: "100px" }}
                    />
                  </div>
                  <div>Ordered: {item.quantityOrdered}</div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowServeModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  // send data to backend
                  try {
                    await axios.patch(`http://localhost:3000/orders/${selectedRow.orderId}/serve`, serveData);
                    Swal.fire({
                      icon: "success",
                      title: "Served",
                      text: "Serve data submitted successfully",
                      timer: 2000,
                      showConfirmButton: false
                    });
                    setShowServeModal(false);
                  } catch (err) {
                    console.error(err);
                    Swal.fire({
                      icon: "error",
                      title: "Error",
                      text: "Failed to submit serve data"
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
    )}


    </div>
  );
}

export default OrdersTable;
