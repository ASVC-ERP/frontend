import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import defaultPic from "../../assets/defaultPic.jpg";
import { Button, Dropdown } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";

function InvoiceTable({ invoices, fetchInvoices }) {
  const columns = [
    {
      name: "Invoice ID",
      selector: (row) => row.invoiceID,
      sortable: true,
      grow: 0.7,
      wrap: true,
      maxWidth: "140px",
    },
    {
      name: "Date",
      selector: (row) =>
        new Date(row.date).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        }),
      sortable: true,
      grow: 0,
      width: "100px",
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
      grow: 1,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "PIC",
      selector: (row) => row.salesAgent,
      sortable: true,
      grow: 0,
      width: "140px",
    },
    {
      name: "Invoice #",
      cell: (row) => (
        <input
          type="text"
          placeholder="Invoice #"
          className="form-control border border-secondary"
          style={{ width: "150px" }}
          value={
            pendingChanges[`invoice-${row.invoiceID}`] ??
            row.invoiceNumber ??
            ""
          }
          onChange={(e) =>
            setPendingChanges((prev) => ({
              ...prev,
              [`invoice-${row.invoiceID}`]: e.target.value,
            }))
          }
        />
      ),
      grow: 1,
      maxWidth: "150px",
    },
    {
      name: "Shipping Details",
      cell: (row) => {
        return (
          <div className="d-flex align-items-center gap-2 ms-2">
            {/* Waybill Number */}
            <input
              type="text"
              placeholder="Waybill"
              className="form-control border border-secondary"
              style={{ width: "130px" }}
              value={
                pendingChanges[`waybill-${row.invoiceID}`] ??
                row.waybillNumber ??
                ""
              }
              onChange={(e) =>
                setPendingChanges((prev) => ({
                  ...prev,
                  [`waybill-${row.invoiceID}`]: e.target.value,
                }))
              }
            />

            {/* Courier */}
            <input
              type="text"
              placeholder="Courier"
              className="form-control border border-secondary"
              style={{ width: "120px" }}
              value={
                pendingChanges[`courier-${row.invoiceID}`] ?? row.courier ?? ""
              }
              onChange={(e) =>
                setPendingChanges((prev) => ({
                  ...prev,
                  [`courier-${row.invoiceID}`]: e.target.value,
                }))
              }
            />

            {/* Delivery Date */}
            <input
              type="date"
              className="form-control border border-secondary"
              style={{ width: "150px" }}
              defaultValue={
                row.shipDate
                  ? new Date(row.shipDate).toISOString().slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                setPendingChanges((prev) => ({
                  ...prev,
                  [`date-${row.invoiceID}`]: e.target.value,
                }))
              }
            />

            {/* SAVE */}
            <Button
              variant="outline-success"
              size="sm"
              className="p-1 d-flex align-items-center justify-content-center"
              onClick={(e) => {
                e.stopPropagation();
                handleSave(row);
              }}
              title="Save"
            >
              <FaSave size={14} />
            </Button>

            {/* DELETE */}
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
          </div>
        );
      },
      grow: 2,
      minWidth: "450px",
    },
  ];

  const API_URL = import.meta.env.VITE_API_URL;

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showRowModal, setShowRowModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  useEffect(() => {
    // ✅ Re-apply search whenever invoices or searchTerm change
    if (searchTerm.trim() !== "") {
      const filtered = invoices.filter((row) =>
        Object.values(row).some((field) =>
          field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(invoices);
    }
  }, [invoices, searchTerm]);

  // 🕒 Auto-refresh invoices every 10s (paused when searching)
  useEffect(() => {
    if (searchTerm.trim() !== "") return; // ⛔ skip refresh if searching

    const interval = setInterval(() => {
      fetchInvoices();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchInvoices, searchTerm]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = invoices.filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const handleRowClick = async (row) => {
    setSelectedRow({
      ...row,
      items: Array.isArray(row.items) ? [...row.items] : [],
    });

    const invoiceID = row.invoiceID;
    const orderId = invoiceID.split("-")[1]; // Extract "ORD049"
    console.log("Extracted orderId:", orderId);

    try {
      const response = await axios.get(
        `${API_URL}/inventory/sales-order-history/get-order-id`,
        { params: { orderId } }
      );

      const history = response.data;
      console.log("Sales Order Data History:", history);

      // 🧩 Merge served/unserved into the selectedRow items
      const updatedItems = row.items.map((item) => {
        const match = history.find(
          (h) =>
            h.itemName?.trim().toLowerCase() ===
            item.itemName?.trim().toLowerCase()
        );
        return {
          ...item,
          served: match ? Number(match.served || 0) : 0,
          unserved: match ? Number(match.unserved || 0) : 0,
        };
      });

      console.log("Updated Items:", updatedItems);

      // Optionally compute totals
      const servedQty = updatedItems.reduce((sum, i) => sum + i.served, 0);
      const unservedQty = updatedItems.reduce((sum, i) => sum + i.unserved, 0);

      setSelectedRow((prev) => ({
        ...prev,
        items: updatedItems,
        servedQty,
        unservedQty,
      }));
    } catch (error) {
      console.error("Error fetching Sales Order:", error);
    } finally {
      setShowRowModal(true);
    }
  };

  const getInvoiceTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const handlePrint = async () => {
    if (!selectedRow) return;

    console.log("selectedRow: ", selectedRow);

    try {
      // Prepare payload
      const payload = {
        invoiceID: selectedRow.invoiceID,
        date: selectedRow.date,
        customerName: selectedRow.customerName,
        customerAddress: selectedRow.customerAddress,
        customerTIN: selectedRow.customerTIN,
        items: selectedRow.items, // send items array as-is
      };

      const response = await axios.post(
        `${API_URL}/list/packing-list`,
        payload,
        { responseType: "blob" } // important for PDF
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

  // Frontend example for Delivery Receipt A
  const handlePrintDR = async (type, selectedRow) => {
    if (!selectedRow) return;

    try {
      // type should be 'a' or 'b'
      const response = await axios.post(
        `${API_URL}/delivery-receipts/${type}`,
        selectedRow,
        { responseType: "blob" } // important for PDF
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

  const handleStatusChange = (row, newStatus) => {
    // Just update local pending changes
    setPendingChanges((prev) => ({
      ...prev,
      [row.invoiceID]: newStatus,
    }));
  };

  const handleSave = (row) => {
    const waybill =
      pendingChanges[`waybill-${row.invoiceID}`] ?? row.waybillNumber;
    const courier = pendingChanges[`courier-${row.invoiceID}`] ?? row.courier;
    const shipDate = pendingChanges[`date-${row.invoiceID}`] ?? row.shipDate;

    // Detect unchanged
    const changed = {
      waybillChanged: !!pendingChanges[`waybill-${row.invoiceID}`],
      courierChanged: !!pendingChanges[`courier-${row.invoiceID}`],
      shipDateChanged: !!pendingChanges[`date-${row.invoiceID}`],
    };

    if (
      !changed.waybillChanged &&
      !changed.courierChanged &&
      !changed.shipDateChanged
    ) {
      console.log("⚪ No changes detected → save skipped");
      return;
    }

    const payload = {
      waybillNumber: waybill,
      courier,
      shipDate,
    };

    console.log(
      "📤 JSON Payload SENT to backend:",
      JSON.stringify(payload, null, 2)
    );

    axios
      .put(`${API_URL}/invoice/${row.invoiceID}/shipping`, {
        waybillNumber: waybill,
        courier,
        shipDate,
      })
      .then(() => {
        const updatedData = filteredData.map((item) =>
          item.invoiceID === row.invoiceID
            ? {
                ...item,
                waybillNumber: waybill,
                courier,
                shipDate,
              }
            : item
        );

        setFilteredData(updatedData);
        setPendingChanges((prev) => {
          const updated = { ...prev };
          delete updated[`waybill-${row.invoiceID}`];
          delete updated[`courier-${row.invoiceID}`];
          delete updated[`date-${row.invoiceID}`];
          return updated;
        });

        fetchInvoices();

        Swal.fire({
          icon: "success",
          title: "Shipping Details Updated",
          text: `Invoice ${row.invoiceID} updated successfully`,
          timer: 1500,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        console.error("❌ Failed to update shipping details:", err);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Could not update shipping details.",
        });
      });
  };

  const handleDelete = (row) => {
    Swal.fire({
      icon: "warning",
      title: "Delete Invoice",
      text: `Are you sure you want to delete invoice ${row.invoiceID}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${API_URL}/invoice/${row.invoiceID}`)
          .then((res) => {
            // Remove invoice from table
            setFilteredData((prev) =>
              prev.filter((item) => item.invoiceID !== row.invoiceID)
            );

            fetchInvoices();

            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: `Invoice ${row.invoiceID} has been deleted and items returned to stock.`,
              timer: 1500,
              showConfirmButton: false,
            });
          })
          .catch((err) => {
            console.error("Failed to delete invoice:", err);
            Swal.fire({
              icon: "error",
              title: "Delete Failed",
              text: "Could not delete invoice. See console for details.",
            });
          });
      }
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
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
      </div>

      {/* Row Modal */}
      {showRowModal && selectedRow && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div
                className="modal-header text-white position-relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                  borderRadius: "0.5rem 0.5rem 0 0",
                  cursor: "move", // so it's clear this is draggable
                }}
              >
                <div className="w-100 d-flex flex-column">
                  {/* Breadcrumb + Close */}
                  <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                    <p className="mb-2 opacity-75 small">Sales &gt; Invoice</p>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
                      onClick={() => setShowRowModal(false)}
                    ></button>
                  </div>

                  {/* Invoice Title + Action Buttons */}
                  <div className="w-100 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      Invoice ID: {selectedRow.invoiceID || selectedRow.orderId}
                    </h5>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        style={{
                          color: "#1E5A84",
                        }}
                        onClick={() => handlePrintDR("a", selectedRow)}
                      >
                        DR with SI
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        style={{
                          color: "#1E5A84",
                        }}
                        onClick={() => handlePrintDR("b", selectedRow)}
                      >
                        DR without SI
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        style={{
                          color: "#1E5A84",
                        }}
                        onClick={() => handlePrint(selectedRow)}
                      >
                        Packing List
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decorative circles */}
                <div
                  className="position-absolute"
                  style={{
                    top: "-50px",
                    right: "-50px",
                    width: "100px",
                    height: "100px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                  }}
                ></div>
                <div
                  className="position-absolute"
                  style={{
                    bottom: "-30px",
                    left: "-30px",
                    width: "60px",
                    height: "60px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "50%",
                  }}
                ></div>
              </div>

              <div className="modal-body">
                <div
                  className="rounded-3"
                  style={{ maxHeight: "250px", overflowY: "auto" }}
                >
                  <ul className="list-unstyled">
                    {(selectedRow.orderedItems || selectedRow.items || []).map(
                      (item, index) => (
                        <li key={index}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            {/* Item Name */}
                            <div className="d-flex align-items-center gap-3">
                              <span className="fw-semibold">
                                {item.itemName}
                              </span>
                            </div>

                            {/* Price and Quantity */}
                            <div className="d-flex flex-column justify-content-center text-end">
                              <span className="fw-semibold">
                                ₱
                                {(item.price * item.quantity).toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                  }
                                )}
                              </span>
                              <small className="text-muted">
                                Qty: {item.quantity} (
                                <span className="text-success">
                                  Served: {item.served ?? 0}
                                </span>{" "}
                                |{" "}
                                <span className="text-danger">
                                  Unserved: {item.unserved ?? 0}
                                </span>
                                )
                              </small>
                            </div>
                          </div>

                          {/* Divider */}
                          {index <
                            (
                              selectedRow.orderedItems ||
                              selectedRow.items ||
                              []
                            ).length -
                              1 && <hr className="my-0 border-secondary" />}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-3 ms-3">
                  <span className="h5 fw-semibold">Total</span>
                  <span className="fw-bold h5">
                    ₱
                    {(
                      selectedRow.totalPrice ||
                      (
                        selectedRow.orderedItems ||
                        selectedRow.items ||
                        []
                      ).reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="modal-footer d-flex justify-content-between align-items-end px-3 ">
                <div>
                  <p className="fw-bold mb-1" style={{ color: "#1E5A84" }}>
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

      <div style={{ width: "100%", overflowX: "auto" }}> 
  <div style={{ minWidth: "800px" }}> {/* minimum table width */}
    <DataTable
      columns={columns}
      data={filteredData}
      onRowClicked={handleRowClick}
      pagination
      paginationPerPage={20}
      highlightOnHover
      fixedHeader
      fixedHeaderScrollHeight="450px"
      className="custom-data-table"
      responsive // ensures mobile/responsive behavior
    />
  </div>
</div>

    </div>
  );
}

export default InvoiceTable;
