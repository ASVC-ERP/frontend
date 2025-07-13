import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function SupplierInvoicesTable() {
  const location = useLocation();
  const supplier = location.state?.row || {};
  const supplierName = supplier.name || "Supplier";
  const supplierID = supplier?.id || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editableSupplier, setEditableSupplier] = useState({ id: '', name: '', address: '' });

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    supplierInvoiceID: "",
    purchaseDate: "",
    items: [{ itemCode: "", quantity: 1, unit: "", unitCost: 0, discount: 0 }],
  });


  useEffect(() => {
    if (!supplierID) return;

    axios
      .get(`http://localhost:3000/invoices/${supplierID}`)
      .then((res) => {
        setInvoiceData(res.data);
        setFilteredData(res.data);
      })
      .catch((err) => console.error("Error fetching invoices:", err));
  }, [supplierID]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = invoiceData.filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const handleUpdateSupplier = async () => {
    try {
      await axios.put(`http://localhost:3000/suppliers/${editableSupplier.id}`, {
        name: editableSupplier.name,
        address: editableSupplier.address,
      });

      Swal.fire({
        icon: "success",
        title: "Supplier Updated",
        text: "Supplier details have been successfully updated.",
        confirmButtonColor: "#0C1D61",
      });

      setShowEditModal(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#0C1D61",
      });
    }
  };

  const handleSubmitInvoice = async () => {
    try {
      const payload = {
        supplierInvoiceID: invoiceForm.supplierInvoiceID,
        purchaseDate: invoiceForm.purchaseDate,
        supplierID: supplierID,
        items: invoiceForm.items.map(item => ({
          ...item,
          grossPrice: item.unitCost * item.quantity - item.discount,
        })),
      };

        console.log("📤 Submitting invoice data:", payload);

        await axios.post("http://localhost:3000/invoices", payload);

      Swal.fire({
        icon: "success",
        title: "Invoice Submitted",
        text: "The supplier invoice has been added successfully!",
        confirmButtonColor: "#0C1D61"
      });

      setShowCreateModal(false);
      setInvoiceForm({
        supplierInvoiceID: "",
        purchaseDate: "",
        items: [{ itemCode: "", quantity: 1, unit: "", unitCost: 0, discount: 0 }],
      });

      const res = await axios.get(`http://localhost:3000/invoices/${supplierID}`);
      setInvoiceData(res.data);
      setFilteredData(res.data);

    } catch (err) {
      console.error("Error submitting invoice:", err);

      if (err.response && err.response.data && err.response.data.message) {
        Swal.fire({
          icon: "error",
          title: "Invoice Error",
          text: err.response.data.message,
          confirmButtonColor: "#0C1D61"
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to submit invoice. Please try again.",
          confirmButtonColor: "#0C1D61"
        });
      }
    }
  };


  const columns = [
    { name: "Invoice ID", selector: (row) => row.supplierInvoiceID, sortable: true },
    { name: "Date", selector: (row) => row.purchaseDate, sortable: true },
    { name: "Number of Items", selector: (row) => row.items?.length || 0, sortable: true },
    {
      name: "Total Gross Price",
      selector: (row) =>
        `₱${row.items.reduce((sum, item) => sum + (item.grossPrice || 0), 0)}`,
      sortable: true,
    },
  ];

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center">
        <p
          className="h1 fw-bold mb-0 ms-3"
          style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}
        >
          {supplierName} Invoices
        </p>
      </div>

      <div className="row table-responsive mx-3">
        <div>
          <div className="position-relative w-25 my-3">
            <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input
              type="text"
              placeholder="Search invoices"
              value={searchTerm}
              onChange={handleSearch}
              className="form-control ps-5 border-2 rounded-3"
            />
          </div>


          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* Left: Edit Supplier Button */}
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                setEditableSupplier({ ...supplier });
                setShowEditModal(true);
              }}
            >
              ✏️ Edit Supplier
            </button>

          <button
            className="btn btn-primary mb-3"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Invoice
          </button>
        </div>

          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            fixedHeader
            fixedHeaderScrollHeight="500px"
            onRowClicked={(row) => {
              setSelectedInvoice(row);
              setShowModal(true);
            }}
          />

          {showEditModal && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Supplier</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowEditModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Supplier ID"
                      value={editableSupplier.id}
                      disabled
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Supplier Name"
                      value={editableSupplier.name}
                      onChange={(e) =>
                        setEditableSupplier({ ...editableSupplier, name: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Supplier Address"
                      value={editableSupplier.address}
                      onChange={(e) =>
                        setEditableSupplier({ ...editableSupplier, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleUpdateSupplier}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showCreateModal && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Create New Supplier Invoice</h5>
                    <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-2">
                      <label>Invoice Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={invoiceForm.supplierInvoiceID}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, supplierInvoiceID: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-2">
                      <label>Purchase Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={invoiceForm.purchaseDate}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, purchaseDate: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <h6>Items</h6>
                      {invoiceForm.items.map((item, index) => (
                        <div key={index} className="d-flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Item Code"
                            className="form-control"
                            value={item.itemCode}
                            onChange={(e) => {
                              const updated = [...invoiceForm.items];
                              updated[index].itemCode = e.target.value;
                              setInvoiceForm({ ...invoiceForm, items: updated });
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            className="form-control"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...invoiceForm.items];
                              updated[index].quantity = parseInt(e.target.value);
                              setInvoiceForm({ ...invoiceForm, items: updated });
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Unit"
                            className="form-control"
                            value={item.unit}
                            onChange={(e) => {
                              const updated = [...invoiceForm.items];
                              updated[index].unit = e.target.value;
                              setInvoiceForm({ ...invoiceForm, items: updated });
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Unit Cost"
                            className="form-control"
                            value={item.unitCost}
                            onChange={(e) => {
                              const updated = [...invoiceForm.items];
                              updated[index].unitCost = parseFloat(e.target.value);
                              setInvoiceForm({ ...invoiceForm, items: updated });
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Discount"
                            className="form-control"
                            value={item.discount}
                            onChange={(e) => {
                              const updated = [...invoiceForm.items];
                              updated[index].discount = parseFloat(e.target.value);
                              setInvoiceForm({ ...invoiceForm, items: updated });
                            }}
                          />
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              const updated = invoiceForm.items.filter((_, i) => i !== index);
                              setInvoiceForm({ ...invoiceForm, items: updated });
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setInvoiceForm({
                            ...invoiceForm,
                            items: [...invoiceForm.items, { itemCode: "", quantity: 1, unit: "", unitCost: 0, discount: 0 }],
                          })
                        }
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmitInvoice}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {showModal && selectedInvoice && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog" role="document">
                <div className="modal-content">

                  <div className="modal-header d-flex flex-column align-items-start">
                    <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                      <p className="mb-2" style={{ color: "#05050599", fontSize: "12px" }}>
                        Supplier &gt; Invoices &gt; {selectedInvoice.supplierInvoiceID}
                      </p>
                      <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                    </div>
                    <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                      <h5 className="mb-0" style={{ color: "#0C1D61" }}>
                        Invoice ID: {selectedInvoice.supplierInvoiceID}
                      </h5>
                    </div>
                  </div>

                  <div className="modal-body">
                    <div className="rounded-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
                      <ul className="list-unstyled">
                        {selectedInvoice.items.map((item, index) => (
                          <li key={index}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              {/* Item Info */}
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src="https://via.placeholder.com/40"
                                  alt="Item"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                  }}
                                />
                                <div className="d-flex flex-column">
                                  <span className="fw-semibold">{item.itemCode}</span>
                                  <small className="text-muted">Qty: {item.quantity} {item.unit}</small>
                                </div>
                              </div>

                              <div className="text-end d-flex flex-column">
                                <span className="fw-semibold">
                                  ₱{item.grossPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                                <small className="text-muted">
                                  Unit: ₱{item.unitCost} | Disc: ₱{item.discount}
                                </small>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3 ms-3">
                      <span className="h5 fw-semibold">Gross Total</span>
                      <span className="fw-bold h5">
                        ₱
                        {selectedInvoice.items.reduce((sum, item) => sum + item.grossPrice, 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="modal-footer d-flex justify-content-between align-items-end px-3">
                    <div>
                      <p className="fw-bold mb-1" style={{ color: "#0C1D61" }}>{supplierName}</p>
                      <p className="mb-0 small">Supplier ID: {selectedInvoice.supplierID}</p>
                    </div>
                    <p className="text-muted small mb-0">
                      {new Date(selectedInvoice.purchaseDate).toLocaleDateString("en-GB", {
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

          {filteredData.length === 0 && (
            <p className="text-center text-muted">
              No invoices found for this supplier.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplierInvoicesTable;
