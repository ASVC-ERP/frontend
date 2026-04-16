import DataTable from "react-data-table-component";
import { useState, useEffect, useMemo } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";
import { useDraggableModal } from "../../hooks/useDraggableModal";

function InvoiceTable({
  invoices = [],
  fetchInvoices = () => {},
  page,
  setPage,
  limit,
  setLimit,
  totalRows,
  progressPending, 
  progressComponent,
}) {
  const { handleHeaderMouseDown, handleMouseMove, handleMouseUp } = useDraggableModal();

  const columns = [
    {
      name: "Order No.",
      selector: (row) => `ORD${String(row.order_id).padStart(4, "0")}`,
      width: "120px",
      center: true,
    },
    {
      name: "Date",
      selector: (row) =>
        new Date(row.invoice_date).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        }),
      width: "120px",
      center: true,
    },
    {
      name: "Customer Name",
      cell: (row) => (
        <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
          {row.customer.name || "N/A"}
        </div>
      ),
      width: "300px",
      wrap: true,
      center: true,
      searchable: true,
    },
    {
      name: "Total Price",
      selector: (row) =>
        row.total_price != null
          ? `₱${Number(row.total_price).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "—",
      width: "150px",
      center: true,
    },
    {
      name: "PIC",
      selector: (row) => row.user.name,
      width: "110px",
      center: true,
    },
    {
      name: "Shipping Details ( Invoice No., Waybill, Courier, Shipping Date)",
      center: true,
      cell: (row) => {
        return (
          <div className="d-flex align-items-center gap-2 ms-2">
            <input
              type="text"
              placeholder="Invoice #"
              className="form-control border border-secondary"
              style={{ width: "170px" }}
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
            {/* Waybill Number */}
            <input
              type="text"
              placeholder="Waybill"
              className="form-control border border-secondary"
              style={{ width: "170px" }}
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
              style={{ width: "170px" }}
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
          </div>
        );
      },
      width: "750px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          className="btn btn-sm btn-outline-success"
          onClick={(e) => {
            e.stopPropagation();
            handleSave(row);
          }}
          title="Save"
        >
          <FaSave />
        </button>
      ),
      width: "70px",
      center: true,
      button: true,
    },
  ];

  const API_URL = import.meta.env.VITE_API_URL;
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showRowModal, setShowRowModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [returnModal, setReturnModal] = useState({ show: false, item: null, quantity: "" });

  const closeReturnModal = () => { setReturnModal({ show: false, item: null, quantity: 0, }); };

  const handleRowClick = async (row) => {
    setSelectedRow(row);
    try {
      const responseInvoice = await axios.get(`${API_URL}/invoice/${row.id}`);
      const invoiceData = responseInvoice.data;
      const servedItems = invoiceData.items || [];

      if (servedItems.length === 0) { setSelectedRow((prev) => ({
          ...prev,
          servedItems: [],
          totalPrice: 0,
          noServedItems: true,
        }));
        return;
      }

      setSelectedRow((prev) => ({
        ...prev,
        servedItems: servedItems,
        totalPrice: getInvoiceTotal(servedItems),
      }));
    } catch (error) {
      console.error("Error fetching sales invoice or product details:", error);
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
      // ✅ Get PDF as blob
      const response = await axios.get(
        `${API_URL}/print/packing-list/${selectedRow.id}`,
        { responseType: "blob" }, // important!
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

  const handlePrintDR = async (type, selectedRow) => {
    if (!selectedRow) return;

    console.log("selectedRow: ", selectedRow);

    try {
      // ✅ Get PDF as blob
      const response = await axios.get(
        `${API_URL}/print/delivery-receipt/${type}/${selectedRow.id}`,
        { responseType: "blob" }, // important!
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

  const handleSave = (row) => {
    Swal.fire({
      title: "Updating Invoice",
      text: "Please wait while we process changes...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
    
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
      invoice_number: invoiceNumber ?? "",
      waybill_number: waybill ?? "",
      courier: courier ?? "",
      shipping_date: shipDate,
    };

    console.log("📤 JSON Payload SENT to backend:", payload);

    axios
      .patch(`${API_URL}/invoice/${row.id}`, payload)
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
            : item,
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

  const handleReturnSubmit = async () => {

    const { item, quantity } = returnModal;
    const id = selectedRow.id;
    const returnQtyNum = Number(quantity);
    const invoiceItemID = Number(item.id)
    console.log(returnQtyNum, invoiceItemID)
    const result = await Swal.fire({
      title: `Confirm Return`,
      html: `Are you sure you want to return
            <b>${returnQtyNum} ${item.products?.unit} </b>
            of <b>${item.products?.item_name}</b>?
            This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes",
      cancelButtonText: "NO, GO BACK!",
    });

    if (!result.isConfirmed) return;
    if (!item || !returnQtyNum || returnQtyNum <= 0) {
      Swal.fire("Invalid Input", "Enter a valid return quantity.", "warning");
      return;
    }

    const maxReturn = (item.quantity ?? 0) - (item.returned_quantity ?? 0);
    if (returnQtyNum > maxReturn) {
      Swal.fire(
        "Error",
        `Cannot return more than ${maxReturn}`,
        "error"
      );
      return;
    }

    Swal.fire({
      title: "Updating Invoice",
      text: "Please wait while we process changes...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await axios.post(`${API_URL}/invoice/${id}/return-item`, {
        invoice_item_id: invoiceItemID,
        return_qty: returnQtyNum
      });
      console.log(res)

      setSelectedRow((prev) => ({
        ...prev,
        servedItems: prev.servedItems.map((i) =>
          i.id === item.id ? {
            ...i, returned_quantity: (i.returned_quantity ?? 0) + quantity,
          } : i
        ),
      }));

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${returnQtyNum} ${item.products?.item_name ?? ""} returned successfully`,
        timer: 1500,
        showConfirmButton: false,
      });

      closeReturnModal();
    } catch(err) {
      console.error("❌ Failed to update shipping details:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update shipping details.",
      });
    }
  };

  return (
    <div>
      {/* Row Modal */}
      {showRowModal && selectedRow && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="modal-dialog" role="document" style={{ maxWidth: "1000px" }}>
            <div className="modal-content">
              <div
                className="modal-header text-white position-relative overflow-hidden cursor-move"
                style={{
                  background:
                    "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                  borderRadius: "0.5rem 0.5rem 0 0",
                  userSelect: "none",
                }}
                onMouseDown={handleHeaderMouseDown}
              >
                <div className="w-100 d-flex flex-column">
                  {/* Breadcrumb + Close */}
                  <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                    <p className="mb-2 opacity-75 small">Sales Invoice {selectedRow.id} </p>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
                      onClick={() => setShowRowModal(false)}
                    ></button>
                  </div>

                  {/* Invoice Title + Action Buttons */}
                  <div className="w-100 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{selectedRow.customer.name}</h5>
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
                  style={{ height: "650px", overflowY: "auto" }}
                >
                  <ul className="list-unstyled">
                    {(selectedRow.servedItems?.length > 0
                      ? selectedRow.servedItems
                      : selectedRow.items?.length > 0
                        ? selectedRow.items
                        : []
                    ).length > 0 ? (
                      (selectedRow.servedItems || selectedRow.items || []).map(
                        (item, index) => (
                          <li key={index}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              {/* Item Name */}
                              <div className="d-flex align-items-center gap-3">
                                <span className="fw-semibold">
                                  {item.products?.item_name ?? "-"}
                                </span>
                              </div>

                              <div className="d-flex align-items-center justify-content-between">
                                {/* Left: item info */}
                                <div>{/* ... */}</div>

                                {/* Right: price + qty + return button */}
                                <div className="d-flex align-items-center gap-3">
                                  <div className="text-end">
                                    <div className="fw-semibold">
                                      ₱{((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </div>
                                    <div className="d-flex gap-1 justify-content-end mt-1">
                                      <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis fw-normal" style={{ fontSize: "0.7rem" }}>
                                        Qty: {item.quantity ?? 0}
                                      </span>
                                      {(item.returned_quantity ?? 0) > 0 && (
                                        <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis fw-normal" style={{ fontSize: "0.7rem" }}>
                                          Returned: {item.returned_quantity}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    className="btn btn-sm btn-danger d-flex align-items-center justify-content-center p-0"
                                    style={{ width: 34, height: 34 }}
                                    title="Return item"
                                    disabled={(item.returned_quantity ?? 0) >= (item.quantity ?? 0)}
                                    onClick={() => setReturnModal({ show: true, item, quantity: "" })}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                      <path d="M2 6h7a4 4 0 1 1 0 8H5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      <path d="M5 3L2 6l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            {index <
                              (
                                selectedRow.servedItems ||
                                selectedRow.items ||
                                []
                              ).length -
                                1 && <hr className="my-0 border-secondary" />}
                          </li>
                        ),
                      )
                    ) : (
                      <div className="text-center text-muted p-3">
                        No served items found.
                      </div>
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
                        selectedRow.servedItems ||
                        selectedRow.items ||
                        []
                      ).reduce((sum, item) => sum + item.price * (item.quantity - (item.returned_quantity ?? 0)), 0)
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {returnModal.show && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h6 className="modal-title">Return Item</h6>
                <button
                  className="btn-close"
                  onClick={() => setReturnModal({ show: false, item: null, quantity: 0 })}
                />
              </div>

              <div className="modal-body">
                <div className="mb-2">
                  <strong>{returnModal.item?.products?.item_name}</strong>
                </div>

                <label className="form-label">Enter return quantity</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max={
                    (returnModal.item?.quantity ?? 0) -
                    (returnModal.item?.returned_quantity ?? 0)
                  }
                  value={returnModal.quantity}
                  onChange={(e) =>
                    setReturnModal((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                />

                <small className="text-muted">
                  Max:{" "}
                  {(returnModal.item?.quantity ?? 0) -
                    (returnModal.item?.returned_quantity ?? 0)}
                </small>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setReturnModal({ show: false, item: null, quantity: 0 })
                  }
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleReturnSubmit()}
                  disabled={returnModal.quantity <= 0}
                >
                  Confirm Return
                </button>
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
            data={invoices}
            onRowClicked={handleRowClick}
            pagination
            paginationServer
            paginationRowsPerPageOptions={[10, 25, 50, 100, 200]}
            paginationPerPage={limit}
            paginationTotalRows={totalRows}
            onChangePage={(page) => setPage(page)}
            onChangeRowsPerPage={(newLimit, page) => {
              setLimit(newLimit);
              setPage(page);
            }}
            highlightOnHover
            fixedHeader
            fixedHeaderScrollHeight="740px"
            className="custom-data-table"
            responsive // ensures mobile/responsive behavior
            progressPending={progressPending}
            progressComponent={progressComponent}
          />
        </div>
      </div>
    </div>
  );
}

export default InvoiceTable;
