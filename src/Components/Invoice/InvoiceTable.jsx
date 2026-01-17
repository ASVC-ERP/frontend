import DataTable from "react-data-table-component";
import { useState, useEffect, useMemo } from "react";
import { IoIosSearch } from "react-icons/io";
import defaultPic from "../../assets/defaultPic.jpg";
import { Button, Dropdown } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";

function InvoiceTable({ invoices, fetchInvoices, customers }) {
  const customerMap = useMemo(() => {
    return customers.reduce((acc, customer) => {
      acc[customer.cid] = customer;
      return acc;
    }, {});
  }, [customers]);

  const columns = [
    {
      name: "Invoice ID",
      selector: (row) => row.id,
      sortable: true,
      grow: 0.7,
      wrap: true,
      maxWidth: "140px",
    },
    {
      name: "Date",
      selector: (row) =>
        new Date(row.invoice_date).toLocaleDateString("en-US", {
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
      selector: (row) => customerMap[row.cid]?.name || "—",
      sortable: true,
      grow: 1,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "PIC",
      selector: (row) => row.sales_agent,
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
            pendingChanges[`invoice-${row.id}`] ?? row.invoice_number ?? ""
          }
          onChange={(e) =>
            setPendingChanges((prev) => ({
              ...prev,
              [`invoice-${row.id}`]: e.target.value,
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
                pendingChanges[`waybill-${row.id}`] ?? row.waybill_number ?? ""
              }
              onChange={(e) =>
                setPendingChanges((prev) => ({
                  ...prev,
                  [`waybill-${row.id}`]: e.target.value,
                }))
              }
            />

            {/* Courier */}
            <input
              type="text"
              placeholder="Courier"
              className="form-control border border-secondary"
              style={{ width: "120px" }}
              value={pendingChanges[`courier-${row.id}`] ?? row.courier ?? ""}
              onChange={(e) =>
                setPendingChanges((prev) => ({
                  ...prev,
                  [`courier-${row.id}`]: e.target.value,
                }))
              }
            />

            {/* Delivery Date */}
            <input
              type="date"
              className="form-control border border-secondary"
              style={{ width: "150px" }}
              value={
                pendingChanges[`date-${row.id}`] ??
                (row.shipping_date
                  ? new Date(row.shipping_date).toISOString().slice(0, 10)
                  : "")
              }
              onChange={(e) =>
                setPendingChanges((prev) => ({
                  ...prev,
                  [`date-${row.id}`]: e.target.value,
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
    console.log("Clicked row:", row);
    setSelectedRow(row);

    const orderId = row.sales_order_id;
    console.log("Extracted orderId:", orderId);

    try {
      // 1️⃣ Get all items for the order
      const responseOrder = await axios.get(
        `${API_URL}/order/${orderId}/order-items`
      );
      const orderItems = responseOrder.data;
      console.log("Order Items:", orderItems);

      // 2️⃣ Get all serve-items for this sales order
      const responseServe = await axios.get(
        `${API_URL}/order/${orderId}/serve-items`
      );
      const serveHistory = responseServe.data;
      console.log("Serve Items History:", serveHistory);

      if (!serveHistory || serveHistory.length === 0) {
        console.warn("No serve-items found for this order");
      }

      // 3️⃣ Fetch product details for each serve-item
      // 3️⃣ Fetch product details for each serve-item
      const serveItemsWithDetails = await Promise.all(
        serveHistory.map(async (serve) => {
          if (!serve.item_code) {
            console.log("Serve item missing item_code:", serve.id);
            return { ...serve, productDetails: null };
          }
          try {
            const productRes = await axios.get(
              `${API_URL}/product/search?q=${serve.item_code}`
            );
            const product = Array.isArray(productRes.data)
              ? productRes.data[0]
              : productRes.data; // PICK FIRST ITEM

            return { ...serve, productDetails: product };
          } catch (err) {
            console.log(`Failed to fetch product ${serve.item_code}:`, err);
            return { ...serve, productDetails: null };
          }
        })
      );

      console.log(
        "Serve Items with Product Details (single object):",
        serveItemsWithDetails
      );

      // 4️⃣ Merge served/unserved and product details into selectedRow items
      const updatedItems = orderItems.map((item) => {
        const match = serveItemsWithDetails.find(
          (h) =>
            h.productDetails?.item_code?.trim().toLowerCase() ===
            item.item_code?.trim().toLowerCase()
        );

        console.log(
          "Matching serve item for order item:",
          item.item_code,
          match
        );

        return {
          ...item,
          served: match ? Number(match.quantity_to_serve || 0) : 0,
          unserved: match
            ? Number(
                (match.quantity_ordered || 0) - (match.quantity_to_serve || 0)
              )
            : 0,
          productDetails: match ? match.productDetails : null,
        };
      });

      console.log("Updated Items with Quantities and Details:", updatedItems);

      // 5️⃣ Compute totals
      const servedQty = updatedItems.reduce((sum, i) => sum + i.served, 0);
      const unservedQty = updatedItems.reduce((sum, i) => sum + i.unserved, 0);

      // 6️⃣ Update selectedRow
      setSelectedRow((prev) => ({
        ...prev,
        items: updatedItems,
        servedQty,
        unservedQty,
      }));

      console.log("Final selectedRow:", {
        ...row,
        items: updatedItems,
        servedQty,
        unservedQty,
      });
    } catch (error) {
      console.error("Error fetching Sales Order or product details:", error);
    } finally {
      setShowRowModal(true);
    }
  };

  const getInvoiceTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  //PACKING LIST
  const handlePrint = async () => {
    if (!selectedRow) return;

    console.log("selectedRow: ", selectedRow);

    try {
      // ✅ Get PDF as blob
      const response = await axios.get(
        `${API_URL}/print/packing-list/${selectedRow.sales_order_id}`,
        { responseType: "blob" } // important!
      );

      // ✅ Create a Blob URL
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);

      // ✅ Open PDF in new tab
      const newWindow = window.open(blobUrl, "_blank");

      if (!newWindow) {
        Swal.fire({
          icon: "warning",
          title: "Popup Blocked",
          text: "Please allow popups to view the PDF.",
        });
      }

      // Optional: release blob URL after 10 seconds
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
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

    console.log("selectedRow: ", selectedRow);

    try {
      // ✅ Get PDF as blob
      const response = await axios.get(
        `${API_URL}/print/delivery-receipt/${type}/${selectedRow.id}`,
        { responseType: "blob" } // important!
      );

      // ✅ Create a Blob URL
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);

      // ✅ Open PDF in new tab
      const newWindow = window.open(blobUrl, "_blank");

      if (!newWindow) {
        Swal.fire({
          icon: "warning",
          title: "Popup Blocked",
          text: "Please allow popups to view the PDF.",
        });
      }

      // Optional: release blob URL after 10 seconds
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
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
    const invoiceNumber =
      pendingChanges[`invoice-${row.id}`] ?? row.invoice_number;
    const waybill = pendingChanges[`waybill-${row.id}`] ?? row.waybill_number;
    const courier = pendingChanges[`courier-${row.id}`] ?? row.courier;
    const shipDate = pendingChanges[`date-${row.id}`] ?? row.shipping_date;

    // Detect unchanged
    const changed = {
      invoiceChanged: !!pendingChanges[`invoice-${row.id}`],
      waybillChanged: !!pendingChanges[`waybill-${row.id}`],
      courierChanged: !!pendingChanges[`courier-${row.id}`],
      shipDateChanged: !!pendingChanges[`date-${row.id}`],
    };

    if (
      !changed.invoiceChanged &&
      !changed.waybillChanged &&
      !changed.courierChanged &&
      !changed.shipDateChanged
    ) {
      console.log("⚪ No changes detected → save skipped");
      return;
    }

    const payload = {
      invoice_number: invoiceNumber,
      waybill_number: waybill,
      courier,
      shipping_date: shipDate,
    };

    console.log("📤 JSON Payload SENT to backend:", payload);

    axios
      .patch(`${API_URL}/invoices/${row.id}`, payload)
      .then(() => {
        const updatedData = filteredData.map((item) =>
          item.id === row.id
            ? {
                ...item,
                invoice_number: invoiceNumber,
                waybill_number: waybill,
                courier,
                shipping_date: shipDate,
              }
            : item
        );

        setFilteredData(updatedData);
        setPendingChanges((prev) => {
          const updated = { ...prev };
          delete updated[`invoice-${row.id}`];
          delete updated[`waybill-${row.id}`];
          delete updated[`courier-${row.id}`];
          delete updated[`date-${row.id}`];
          return updated;
        });

        fetchInvoices();

        Swal.fire({
          icon: "success",
          title: "Shipping Details Updated",
          text: `Invoice ${row.id} updated successfully`,
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
          .delete(`${API_URL}/invoices/${row.invoiceID}`)
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
                      Invoice ID:{" "}
                      {selectedRow.order_invoice || selectedRow.order_invoice}
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
                                {item.productDetails.item_name}
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
                  {new Date(selectedRow.invoice_date).toLocaleDateString("en-GB", {
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
        <div style={{ minWidth: "800px" }}>
          {" "}
          {/* minimum table width */}
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
