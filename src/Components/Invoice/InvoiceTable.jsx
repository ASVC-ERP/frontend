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
      selector: (row) => row.customer.name || "—",
      width: "300px",
      wrap: true,
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
  const [selectedRow, setSelectedRow] = useState(null);
  const [showRowModal, setShowRowModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  // 🕒 Auto-refresh invoices every 10s (paused when searching)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchInvoices();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchInvoices]);

  const handleRowClick = async (row) => {
    console.log("Clicked row:", row);
    setSelectedRow(row);

    const orderId = row.order_id;
    console.log("Extracted orderId:", orderId);

    try {
      // 1️⃣ Get invoiced order-items
      const responseInvoice = await axios.get(`${API_URL}/invoice/${row.id}`);
      const invoiceData = responseInvoice.data;

      console.log("Invoice:", invoiceData);

      const servedItems = invoiceData.items || [];
      console.log("Served Items from Invoice:", servedItems);

      if (servedItems.length === 0) {
        setSelectedRow((prev) => ({
          ...prev,
          servedItems: [],
          totalPrice: 0,
          noServedItems: true,
        }));
        return;
      }

      // 3️⃣ Fetch product details for each serve-item
      const serveItemsWithDetails = await Promise.all(
        servedItems.map(async (serve) => {
          if (!serve.item_code) {
            console.log("Serve item missing item_code:", serve.id);
            return { ...serve };
          }
          try {
            const productRes = await axios.get(
              `${API_URL}/product/search?q=${serve.item_code}`,
            );
            const product = Array.isArray(productRes.data)
              ? productRes.data[0]
              : productRes.data;

            return { ...serve };
          } catch (err) {
            console.log(`Failed to fetch product ${serve.item_code}:`, err);
            return { ...serve };
          }
        }),
      );

      console.log("Served Items with Product Details:", serveItemsWithDetails);

      // 4️⃣ Update selectedRow with servedItems + totalPrice
      setSelectedRow((prev) => ({
        ...prev,
        servedItems: serveItemsWithDetails,
        totalPrice: getInvoiceTotal(serveItemsWithDetails),
      }));

      console.log("Final selectedRow:", {
        ...row,
        servedItems: serveItemsWithDetails,
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
          <div className="modal-dialog modal-lg" role="document">
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
                    <p className="mb-2 opacity-75 small">Sales &gt; Invoice</p>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
                      onClick={() => setShowRowModal(false)}
                    ></button>
                  </div>

                  {/* Invoice Title + Action Buttons */}
                  <div className="w-100 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Invoice ID: {selectedRow.id}</h5>
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

                              {/* Price and Quantity */}
                              <div className="d-flex flex-column justify-content-center text-end">
                                <span className="fw-semibold">
                                  ₱
                                  {(
                                    (item.price ?? 0) * (item.quantity ?? 0)
                                  ).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                                <small className="text-muted">
                                  Served: {item.quantity ?? 0}
                                </small>
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
                      ).reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0,
                      )
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
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
