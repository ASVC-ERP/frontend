import { useState, useEffect, useRef, useMemo, React } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { Modal, Button } from "react-bootstrap";
import { IoIosSearch } from "react-icons/io";
import { IoChevronDown } from "react-icons/io5";
import axios from "axios";
import Swal from "sweetalert2";
import ServeQuantityInput from "./ServeQantityInput";
import { useDraggableModal } from "../../hooks/useDraggableModal";
import CostHistoryTab from "../Inventory/InventoryTabs/CostHistoryTab";
import { checkDuplicateProduct } from "../../hooks/useOrderHelpers";

const userApprove = JSON.parse(localStorage.getItem("user"));
const roleApprove = userApprove?.role || "";
console.log("User role for approvals:", roleApprove);

const API_URL = import.meta.env.VITE_API_URL;

function OrdersTable({ 
  orders, 
  setOrders, 
  customers, 
  page,
  setPage,
  limit,
  setLimit,
  totalRows, 
}) {

  const { handleHeaderMouseDown, handleMouseMove, handleMouseUp } = useDraggableModal();

  const customerMap = useMemo(() => {
    return customers.reduce((acc, customer) => {
      acc[customer.id] = customer;
      return acc;
    }, {});
  }, [customers]);

  const customerNameMap = useMemo(() => {
    return customers.reduce((acc, customer) => {
      acc[customer.name] = customer;
      return acc;
    }, {});
  }, [customers]);

  const columns = [
    {
      name: "Order",
      selector: (row) => row.id,
      width: "100px",
    },
    {
      name: "Date",
      selector: (row) =>
        new Date(row.order_date).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "2-digit",
        }),
      width: "100px",
    },
    {
      name: "Customer Name",
      selector: (row) => row.customer?.name || "—",
      width: "300px",
      wrap: true,
    },
    {
      name: "Address",
      selector: (row) => row.customer?.address || "—",
      width: "700px",
      wrap: true,
    },
    {
      name: "PIC",
      selector: (row) => row.user?.name || "—",
      width: "150px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      grow: 1,
      minWidth: "150px",
      cell: (row) => {
        const statusKey = row.status?.trim().toLowerCase();

        const statusStyle = statusColors[statusKey] || {
          bg: "#6c757d",
          text: "#fff",
        };

        return (
          <span
            className="badge px-3 py-2 fw-semibold text-uppercase"
            style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
              borderRadius: "20px",
              letterSpacing: "0.5px",
            }}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      name: "Actions",
      grow: 0,
      width: "100px",
      cell: (row) => (
        row.status === "Open" ? (
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
        ) : null
      ),
    },
  ];

  const [filteredData, setFilteredData] = useState([]);
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
  const [customerID, setCustomerID] = useState("");

  const [showServeModal, setShowServeModal] = useState(false);
  const [serveData, setServeData] = useState([]);

  const inputRefs = useRef([]);

  const MAX_ITEMS = 16;
  const [itemLimitWarning, setItemLimitWarning] = useState(false);
  const [addedItemOnEdit, setAddedItemOnEdit] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showCostModal, setShowCostModal] = useState(false);

  const statusColors = {
    open: {
      bg: "#ffc107",
      text: "#000",
    },
    "for approval": {
      bg: "#0dcaf0",
      text: "#000",
    },
    "partial served": {
      bg: "#fd7e14",
      text: "#fff",
    },
    served: {
      bg: "#198754",
      text: "#fff",
    },
    invoiced: {
      bg: "#0d3b66",
      text: "#fff",
    },
    rejected: {
      bg: "#dc3545",
      text: "#fff",
    },
  };
  const statusKey = selectedRow?.status?.trim().toLowerCase();
  const statusStyle = statusColors[statusKey] || {
    bg: "#6c757d",
    text: "#fff",
  };

  const fetchOrders = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const endpoint =
      roleApprove === "agent"
        ? `${API_URL}/order?agent=${encodeURIComponent(user.role)}`
        : `${API_URL}/order`;

    axios
      .get(endpoint, {
        params: { page, limit },
      })
      .then((res) => {
        setOrders(res.data.data);

        if (searchTerm.trim() !== "") {
          const filtered = res.data.data.filter((row) =>
            Object.values(row).some((field) =>
              field
                ?.toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
            ),
          );
          setFilteredData(filtered);
        } else
          setFilteredData(res.data.data);


        if (res.data.total) 
          setTotalPages(Math.ceil(res.data.total / limit));
      })
      .catch((err) => { console.error("❌ Failed to fetch orders:", err); });
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [page, limit]);

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
      c.name.toLowerCase().includes(customerQuery.toLowerCase()),
    );

    setCustomerSuggestions(filtered);
  }, [customerQuery, customers]);

  const handleCustomerNameChange = (e) => {
    const value = e.target.value;

    setCustomerQuery(value);
    setEditableRow((prev) => ({
      ...prev,
      customerName: value,
      customerID: customerNameMap[value]?.cid || "",
    }));
  };

  const handleSelectCustomer = (customer) => {
    setCustomerID(customer.id);
    setCustomerQuery(customer.name);
    setCustomerSuggestions([]);

    setEditableRow((prev) => ({
      ...prev,
      customerID: customer.id,
      customerName: customer.name,
    }));
  };

  const SEARCHABLE_SELECTORS = [
    row => row.customer?.name,
    row => row.status,
  ];
  
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = orders.filter(row =>
      SEARCHABLE_SELECTORS.some(fn => {
        const field = fn(row);
        return (
          field &&
          field.toString().toLowerCase().includes(value)
        );
      })
    );
  
    setFilteredData(filtered);
  };

  const initializeItems = (items) => {
    return items.map((item) => {
      const availablePrices = [
        item.products?.price1,
        item.products?.price2,
        item.products?.price3,
        item.products?.price4,
      ].filter((p) => p != null);

      const isCustomPrice =
        item.price != null && !availablePrices.includes(Number(item.price));

      return {
        ...item,
        products: item.products || null,
        itemName: item.itemName || item.products?.item_name || "",
        stock: item.stock || item.products?.stock || 0,
        quantity: item.quantity || 1,
        availablePrices,
        price:
          item.price ?? item.products?.actual_price ?? availablePrices[0] ?? 0,
        customPriceEnabled: isCustomPrice,
        customPrice: isCustomPrice ? item.price : null,
        unit: item.unit || item.products?.unit || "",
      };
    });
  };

  const handleEdit = async (row) => {
    setShowRowModal(false);
    setCustomerQuery(row.customer.name || "");
    setCustomerID(row.customer.id || "");

    console.log("row: ",row);

    try {
      const response = await axios.get(
        `${API_URL}/order/${row.id}/order-items`,
      );
      const orderedItems = response.data;
      console.log("items: ",orderedItems);

      const updatedOrderedItems = orderedItems.map((ordered) => {
        const isCustom = ordered.customPriceEnabled;

        return {
          ...ordered,
          customPrice: isCustom ? ordered.orderedPrice : null,
          price: isCustom ? null : ordered.orderedPrice,
        };
      });

      setEditableRow((prev) => ({
        ...prev,
        items: initializeItems(prev.items),
      }));
      setSelectedRow(row);
      setShowEditModal(true);
    } catch (err) {
      console.error("Error loading prices:", err);
    }
  };

  const handleRowClick = async (row) => {
    console.log("Row clicked:", row);

    try {
      const res = await axios.get(`${API_URL}/order/id/${row.id}`);
      const orderData = res.data;
      console.log("Fetched orders:", orderData);

      setSelectedRow(orderData);
      setEditableRow(orderData);
      setIsEditing(false);
      setShowRowModal(true);
    } catch (err) {
      console.error("Error fetching served orders:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableRow((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setEditableRow((prev) => {
      const currentCount = prev.items?.length || 0;

      if (currentCount === MAX_ITEMS - 1) {
        // going from 15 → 16
        setItemLimitWarning(true);
      }

      if (currentCount >= MAX_ITEMS) {
        return prev;
      }

      const newItems = [
        ...(prev.items || []),
        {
          products: null,
          itemName: "",
          quantity: 1,
          availablePrices: [],
          price: 0,
          customPriceEnabled: false,
          customPrice: null,
          unit: "",
          item_code: "",
          stock: 0,
        },
      ];

      setActiveIndex(newItems.length - 1);
      setAddedItemOnEdit(true);
      return { ...prev, items: newItems };
    });

    setQuery("");
  };

  // Remove an item by index
  const removeItem = (index) => {
    setEditableRow((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);

      if (newItems.length < MAX_ITEMS) {
        setItemLimitWarning(false);
      }

      return { ...prev, items: newItems };
    });
  };

  // Update item field
  const updateItem = (index, field, value) => {
    setEditableRow((prev) => {
      console.log("=== updateItem called ===");
      console.log("index:", index);
      console.log("field:", field);
      console.log("value:", value);
      console.log("PREV ITEM:", prev.items[index]);

      const items = prev.items.map((item, i) => {
        if (i !== index) return item;

        let updatedItem = { ...item };

        // Numeric fields
        const numericFields = ["quantity", "price", "customPrice"];
        if (numericFields.includes(field)) {
          updatedItem[field] = Number(value);
        } else {
          updatedItem[field] = value;
        }

        // Handle switching between preset and custom price
        if (field === "customPriceEnabled") {
          if (value === true) {
            // switch to custom, copy current price
            updatedItem.customPrice = updatedItem.price ?? 0;
          } else {
            // switch back to preset, keep current selected price if available
            updatedItem.price =
              updatedItem.price ?? updatedItem.availablePrices[0] ?? 0;
          }
        }

        console.log("UPDATED ITEM:", updatedItem);

        return updatedItem;
      });

      return { ...prev, items };
    });
  };

  const handleSave = async () => {
    try {
      // 🔹 Prepare payload according to backend DTO
      const payload = {
        cid: customerID,
        order_date: editableRow.order_date,
        discount: editableRow.discount || 0,
        items: (editableRow.items || []).map((it) => ({
          ...(it.id ? { id: it.id } : {}), // 👈 KEEP ROW ID IF EXISTS
          item_id: it.products?.id ?? it.item_id,
          quantity: Number(it.quantity) || 0,
          price: it.customPriceEnabled
            ? Number(it.customPrice) || 0
            : Number(it.price) || 0,
        }))
      };
  
      console.log("Payload being sent:", payload);
  
      // 🔹 Send patch request to update the order
      await axios.put(`${API_URL}/order/id/${editableRow.id}`, payload);
  
      // 🔹 Refetch orders to get the updated data with new IDs
      await fetchOrders();
  
      setIsEditing(false);
      setShowEditModal(false);
  
      Swal.fire({
        icon: "success",
        title: "Order Updated",
        text: `Order ${editableRow.order_code} was updated successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });
  
      // ✅ Fetch the fresh order data and reopen it
      const updatedOrder = await axios.get(`${API_URL}/order/id/${editableRow.id}`);
      handleRowClick(updatedOrder.data);
  
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

  const handleDelete = (selectedRow) => {
    Swal.fire({
      icon: "warning",
      title: "Delete Order",
      text: `Are you sure you want to delete ${selectedRow.order_code}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${API_URL}/order/id/${selectedRow.id}`)
          .then((res) => {
            fetchOrders();

            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: `${selectedRow.order_code} has been deleted successfully.`,
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
      const res = await axios.get(`${API_URL}/product/search`, {
        params: {
          q: value,
          limit: 20,
        },
      });

      const itemsWithPrices = res.data.map((item) => ({
        ...item,
        itemCode: item.item_code,
        itemName: item.item_name,
        prices: [item.price1, item.price2, item.price3, item.price4].filter(
          (p) => p != null
        ),
      }));

      setSuggestions(itemsWithPrices);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (index, item) => {
    console.log("Selected item:", item, "for row index:", index);

    if (checkDuplicateProduct(item.item_name, editableRow.items, index)) {
      setQuery("");
      setSuggestions([]);
      return;
    }

    setEditableRow((prev) => {
      console.log("Previous editableRow:", prev);

      // Make a copy of items
      const updatedItems = [...prev.items];

      // Update the selected row
      updatedItems[index] = {
        ...updatedItems[index],
        item_id: item.item_id,
        item_code: item.item_code,
        products: item, // store full product details for reference
        itemName: item.item_name,
        stock: item.stock || 0,
        quantity: 1,
        availablePrices: [
          item.price1,
          item.price2,
          item.price3,
          item.price4,
        ].filter((p) => p != null),
        price: item.actual_price || item.price2 || 0, // default to price1
        customPriceEnabled: false, // always start with default price
        customPrice: null,
        unit: item.unit,
      };

      console.log("Updated items:", updatedItems);

      return { ...prev, items: updatedItems }; // update items in editableRow
    });

    // Clear search input and suggestions
    setQuery("");
    setSuggestions([]);
    setActiveIndex(null);
  };

  const handlePrint = async () => {
    if (!selectedRow) return;

    console.log("selectedRow: ", selectedRow);

    try {
      // ✅ Get PDF as blob
      const response = await axios.get(
        `${API_URL}/print/sales-order/${selectedRow.id}`,
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

  const handleServe = async (row) => {
    try {
      setSelectedRow(row);

      console.log("Loading order for serving:", row);

      // 🔹 Fetch full order details
      const res = await axios.get(`${API_URL}/order/id/${row.id}`);
      const order = res.data;

      console.log("ServeData:", order);
      setServeData(order);
      setShowServeModal(true);
    } catch (err) {
      console.error("Failed to load order:", err);
      Swal.fire({
        icon: "error",
        title: "Load Error",
        text: "Unable to load order details.",
      });
    }
  };

  const handleUnserve = async (row) => {
    try {
      setSelectedRow(row);
      console.log("order id:", row.id);
      await axios.post(`${API_URL}/order/id/${row.id}/unserve`);

      Swal.fire({
        icon: "success",
        title: "Order Unserved!",
        text: "Order has been unserved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowRowModal(false);

      fetchOrders();
    } catch (err) {
      console.error("Failed to unserve order:", err);
      Swal.fire({
        icon: "error",
        title: "Unserve Error",
        text: "Unable to unserve order.",
      });
    }
  };

  const updateServeQuantity = (index, value) => {
    setServeData((prev) => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        serve_qty: value,
      };
      return { ...prev, items };
    });
  };

  const handleApprove = async (row) => {
    try {
      // 🔹 Show loading state
      Swal.fire({
        title: "Approving order…",
        text: "Please wait while we process the approval.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.post(`${API_URL}/order/id/${row.id}/approve`);

      Swal.close();

      // 🔹 Success feedback
      Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Order has been approved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchOrders();
    } catch (error) {
      console.error("[handleApprove] Error approving order:", error);
      Swal.close();

      // 🔹 More informative error handling
      const message =
        error.response?.data?.message ||
        "Failed to approve order. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text: message,
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
      await axios.post(`${API_URL}/order/id/${row.id}/reject`);

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

  const handleInvoice = async (row) => {
    try {
      // 🔹 Show loading state
      Swal.fire({
        title: "Creating order invoice…",
        text: "Please wait while we process the invoice.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.post(`${API_URL}/order/id/${row.id}/invoice`);

      Swal.close();

      // 🔹 Success feedback
      Swal.fire({
        icon: "success",
        title: "Created!",
        text: "Sales Invoice has been created successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchOrders();
      console.log("closing modal");
      setShowRowModal(false);
    } catch (error) {
      console.error("[handleInvoice] Error creating invoice:", error);
      Swal.close();

      // 🔹 More informative error handling
      const message =
        error.response?.data?.message ||
        "Failed to create invoice. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Invoice Creation Failed",
        text: message,
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
            placeholder="Search order"
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
        paginationServer
        paginationRowsPerPageOptions={[50, 100, 250, 500]}
        paginationPerPage={limit}
        paginationTotalRows={totalRows}
        onChangePage={(page) => setPage(page)}
        onChangeRowsPerPage={(newLimit, page) => {
          setLimit(newLimit);
          setPage(page);
        }}
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="700px"
        onRowClicked={handleRowClick}
        className="custom-data-table"
      />

      {showRowModal && selectedRow && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" 
            tabIndex="-1" 
            role="dialog"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
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
                  className="modal-header d-flex flex-column align-items-start text-white position-relative overflow-hidden cursor-move"
                  style={{
                    background: "#246c9d 100%",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    userSelect: 'none'
                  }}
                  onMouseDown={handleHeaderMouseDown}
                >
                  <div className="w-100 d-flex justify-content-between align-items-center my-2">
                    {/* LEFT INFO */}
                    <div>
                      <h5 className="mb-0 d-flex align-items-center">
                      Order Code: ORD{String(selectedRow?.id).padStart(3, "0")}
                        <span
                          className="badge px-3 py-1 fw-semibold text-uppercase ms-2"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            borderRadius: "20px",
                            fontSize: "0.75rem", // slightly larger, readable
                            letterSpacing: "0.5px",
                          }}
                        >
                          {selectedRow?.status || "Unknown"}
                        </span>
                      </h5>

                      <h5 className="mb-0">
                        Customer: {selectedRow?.customer?.name || "—"}
                      </h5>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="d-flex gap-2 ms-auto align-items-center">
                      {(selectedRow?.status?.trim().toLowerCase() ===
                        "served" ||
                        selectedRow?.status?.trim().toLowerCase() ===
                          "partial served") && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-light"
                            style={{ color: "#246c9d" }}
                            onClick={() => handleUnserve(selectedRow)}
                          >
                            Unserve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light"
                            style={{ color: "#246c9d" }}
                            onClick={() => handleInvoice(selectedRow)}
                          >
                            Create Invoice
                          </button>
                        </>
                      )}

                      {selectedRow?.status?.trim().toLowerCase() === "open" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          style={{ color: "#246c9d" }}
                          onClick={() => handleEdit(selectedRow)}
                        >
                          Edit
                        </button>
                      )}

                      {(selectedRow?.status?.trim().toLowerCase() !==
                        "served" &&
                        selectedRow?.status?.trim().toLowerCase() !==
                          "partial served") && (
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          style={{ color: "#246c9d" }}
                          onClick={() => handlePrint(true)}
                        >
                          Print Preview
                        </button>
                      )}

                      {selectedRow?.status?.trim().toLowerCase() === "open" && (
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

                      {roleApprove?.toLowerCase() === "admin" &&
                        selectedRow?.status?.trim().toLowerCase() ===
                          "for approval" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm"
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

                            <button
                              type="button"
                              className="btn btn-sm"
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
                          </>
                        )}

                      {/* CLOSE BUTTON */}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-4 me-2"
                        onClick={() => setShowRowModal(false)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-body">
                  <div
                    className=" rounded-3"
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                      overflowX: "visible",
                    }}
                  >
                    <ul className="list-unstyled">
                      {selectedRow.items.map((item, index) => (
                        <>
                          <li key={index}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              {/* Image and Product Info */}
                              <div className="d-flex flex-column">
                                <>
                                  <span 
                                    className="fw-semibold position-relative price-hover"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setShowCostModal(true);
                                    }}
                                  >
                                    {item.products.item_name}{" "}
                                    <div className="price-tooltip">
                                      <strong>Prices</strong>
                                      {(
                                        <div>
                                          <span>Supplier Cost</span>
                                          <span className="fw-bold text-success">₱{item.products.cost.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {(
                                        <div>
                                          <span>Price 1</span>
                                          <span className="fw-bold text-success">₱{item.products.price1.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {(
                                        <div>
                                          <span>Price 2</span>
                                          <span className="fw-bold text-success">₱{item.products.price2.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {(
                                        <div>
                                          <span>Price 3</span>
                                          <span className="fw-bold text-success">₱{item.products.price3.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {(
                                        <div>
                                          <span>Price 4</span>
                                          <span className="fw-bold text-success">₱{item.products.price4.toLocaleString()}</span>
                                        </div>
                                      )}
                                    </div>
                                    {/* ADD ITEM NAME */}
                                  </span>

                                  <small className="text-muted">
                                    Price: ₱{item.price} | Qty: {item.quantity}
                                    {selectedRow.status === "For Approval" && (
                                      <>
                                        {" "}
                                        (
                                        <span className="text-primary">
                                          To Serve:{" "}
                                          {item.serve_qty ??
                                            0}
                                        </span>{" "}
                                        |{" "}
                                        <span className="text-danger">
                                          Unserved:{" "}
                                          {(item.quantity ?? 0) -
                                            (item.serve_qty ?? 0)}
                                        </span>
                                        )
                                      </>
                                    )}
                                    {(selectedRow.status === "Partial Served" ||
                                      selectedRow.status === "Served" || selectedRow.status === "Invoiced") && (
                                      <span className="text-success">
                                        {" "}
                                        (Served:{" "}
                                        {item.serve_qty ?? 0}
                                        )
                                      </span>
                                    )}
                                  </small>
                                </>
                              </div>

                              {/* Price */}
                              <div className="text-end d-flex flex-column">
                                <span className="fw-semibold">
                                  {new Intl.NumberFormat("en-PH", {
                                    style: "currency",
                                    currency: "PHP",
                                  }).format(
                                    (item.customPriceEnabled ? Number(item.customPrice || 0) : Number(item.price || 0)) *
                                    (selectedRow.status !== 'Open' ? Number(item.serve_qty || 0) : Number(item.quantity || 0))
                                  )}
                                </span>
                              </div>
                            </div>
                          </li>
                          <hr className="my-0 border-secondary" />
                        </>
                      ))}

                      {/* NOTE BY JIKO: NEED TO MOVE THIS OUTSIDE MAP OR ELSE WILL CALL ALL ITEM COST HISTORY MODAL */}
                      <Modal show={showCostModal} onHide={() => setShowCostModal(false)} size="xl">
                        <Modal.Header closeButton 
                          className="border-0 ps-3 cursor-move"
                          onMouseDown={handleHeaderMouseDown}
                        >
                          <Modal.Title>
                            Cost History - {selectedItem?.products?.item_name}
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          {selectedItem && <CostHistoryTab item={selectedItem.products} />}
                        </Modal.Body>
                      </Modal>
                    </ul>
                  </div>

                  {/* Total Row */}
                  <div className="d-flex justify-content-between align-items-center pt-3 ms-3">
                    <span className="h5 fw-semibold ">Total</span>
                    <span className="fw-bold h5">
                    {new Intl.NumberFormat("en-PH", {
                      style: "currency",
                      currency: "PHP",
                    }).format(
                      editableRow?.items?.reduce((sum, item) => {
                        const price = item.customPriceEnabled
                          ? Number(item.customPrice || 0)
                          : Number(item.price || 0);
                        
                        const qty = editableRow?.status !== 'Open' 
                          ? Number(item.serve_qty || 0)
                          : Number(item.quantity || 0);
                        return sum + price * qty;
                      }, 0) || 0  
                    )}
                    </span>
                  </div>
                </div>
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
          <div className="modal fade show d-block" 
            tabIndex="-1" 
            role="dialog"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="modal-dialog modal-xl" role="document">
              <div className="modal-content">
                {/* Header */}
                <div
                  className="modal-header d-flex flex-column align-items-start text-white position-relative overflow-hidden cursor-move"
                  style={{
                    background:
                      "linear-gradient(135deg, #246c9d 0%, #1e3c72 100%)",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    userSelect: 'none'
                  }}
                  onMouseDown={handleHeaderMouseDown}
                >
                  <div className="w-100 d-flex justify-content-between align-items-center ">
                    <p className="mb-2 opacity-75" style={{ fontSize: "12px" }}>
                      Sales &gt; Order &gt; {selectedRow.order_code}
                    </p>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
                      onClick={() => setShowEditModal(false)}
                    ></button>
                  </div>

                  <div className="w-100 d-flex justify-content-between align-items-center ">
                    <h5 className="mb-0">
                      Edit Order {selectedRow.order_code}
                    </h5>
                  </div>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <form>
                    <div className="row mb-2 position-relative">
                      {/* CID */}
                      <div className="col-md-1">
                        <label className="form-label">ID</label>
                        <input
                          type="text"
                          className="form-control"
                          value={customerID}
                          placeholder="Customer ID"
                          disabled
                        />
                      </div>
                      {/* Name */}
                      <div className="col-md-6 ">
                        <label className="form-label">Customer</label>
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
                            className="list-group position-absolute"
                            style={{ zIndex: 1000 }}
                          >
                            {customerSuggestions.map((c) => (
                              <li
                                key={c.cid}
                                className="list-group-item list-group-item-action"
                                onMouseDown={() => handleSelectCustomer(c)}
                              >
                                {c.name}
                              </li>
                            ))}
                          </ul>
                        )}
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
                      style={{ maxHeight: "430px", overflowY: "auto" }}
                    >
                      {editableRow?.items.map((item, index) => (
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
                                activeIndex === index
                                  ? query
                                  : item.products?.item_name
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
                            onWheel={(e) => e.target.blur()}
                            onChange={(e) =>
                              updateItem(index, "quantity", e.target.value)
                            }
                            className="form-control"
                            style={{ width: "80px" }}
                          />

                          {/* Price options */}
                          {(() => {
                            console.log(
                              "Enabled?",
                              index,
                              ":",
                              item.customPriceEnabled,
                            );
                            return item.customPriceEnabled ? (
                              <div
                                className="input-group"
                                style={{ width: "120px" }}
                              >
                                <input
                                  type="number"
                                  className="form-control text-center"
                                  value={item.customPrice || ""}
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "customPrice",
                                      Number(e.target.value),
                                    )
                                  }
                                  placeholder="Enter price"
                                  style={{ fontSize: "14px" }}
                                />
                                <button
                                  type="button"
                                  className="btn border-top border-bottom border-end border-0 bg-white"
                                  title="Back to list"
                                  onClick={() =>
                                    updateItem(
                                      index,
                                      "customPriceEnabled",
                                      false,
                                    )
                                  }
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
                                    : item.price != null
                                      ? String(item.price)
                                      : ""
                                }
                                onChange={(e) => {
                                  const val = e.target.value;

                                  if (val === "custom") {
                                    updateItem( index, "customPriceEnabled", true,);
                                  } else {
                                    updateItem(index, "price", Number(val));
                                  }
                                }}
                              >
                                {[
                                  item.products?.price1,
                                  item.products?.price2,
                                  item.products?.price3,
                                  item.products?.price4,
                                ]
                                  .filter((p) => p != null)
                                  .map((p, i) => (
                                    <option key={i} value={p}>
                                      ₱{Number(p).toLocaleString()}
                                    </option>
                                  ))}
                                <option value="custom">Custom...</option>
                              </select>
                            );
                          })()}

                          {/* Item total */}
                          <div
                            className="text-end fw-semibold"
                            style={{ width: "100px" }}
                          >
                            {(() => {
                              const price = item.customPriceEnabled
                                ? Number(item.customPrice || 0)
                                : Number(item.price || 0);
                              const total =
                                price * (Number(item.quantity) || 0);

                              return `₱${total.toLocaleString(undefined, {
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
                    fontSize: "1.2rem", // increase text size
                    fontWeight: 600, 
                  }}
                >
                  <span className="fw-semibold fs-5">Total</span>
                  <span>
                    {new Intl.NumberFormat("en-PH", {
                      style: "currency",
                      currency: "PHP",
                    }).format(
                      editableRow?.items?.reduce((sum, item) => {
                        const price = item.customPriceEnabled
                          ? Number(item.customPrice || 0)
                          : Number(item.price || 0);
                        const quantity = Number(item.quantity || 0);
                        return sum + price * quantity;
                      }, 0) || 0
                    )}
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

          <div className="modal fade show d-block" 
            tabIndex="-1" 
            role="dialog"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="modal-dialog modal-lg modal-dialog-centered"
              role="document"
            >
              <div className="modal-content">
                {/* Header */}
                <div
                  className="modal-header d-flex flex-column align-items-start text-white position-relative overflow-hidden cursor-move"
                  style={{
                    background:
                      "linear-gradient(135deg, #246c9d 0%, #1e3c72 100%)",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    userSelect: 'none'
                  }}
                  onMouseDown={handleHeaderMouseDown}
                >
                  <div className="w-100 d-flex justify-content-between align-items-center">
                    <p className="mb-2 opacity-75" style={{ fontSize: "12px" }}>
                      Order &gt; Serve &gt; {selectedRow.id}
                    </p>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-4"
                      onClick={() => setShowServeModal(false)}
                    ></button>
                  </div>

                  <div className="w-100 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      Serve Items for Order #{selectedRow.id}
                    </h5>
                  </div>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <h6 className="mb-3">Order Items</h6>

                  {/* Header Labels */}
                  <div className="d-flex gap-2 align-items-center mb-2 pb-2 border-bottom w-100 me-4">
                    <div
                      className="flex-grow-1 fw-semibold text-muted"
                      style={{ fontSize: "14px" }}
                    >
                      Item Name
                    </div>
                    <div
                      className="text-center fw-semibold text-muted me-3"
                      style={{ width: "100px", fontSize: "14px" }}
                    >
                      To Serve
                    </div>

                    <div
                      className="text-center fw-semibold text-muted me-2"
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
                              <span className="fw-medium">
                                {item.products.item_name}
                              </span>
                              <small
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "700",
                                  color:
                                    item.products.stock < 5
                                      ? "#B64345"
                                      : item.products.stock < 20
                                        ? "#F8B13D"
                                        : "#ACACAC",
                                }}
                              >
                                In stock: {item.products.stock}
                              </small>
                            </div>

                            {/* Served */}
                            <ServeQuantityInput
                              item={item}
                              index={index}
                              quantityToServe={item.serve_qty}
                              updateServeQuantity={updateServeQuantity}
                            />

                            {/* Ordered */}
                            <div
                              className="d-flex align-items-center justify-content-center fw-semibold"
                              style={{ width: "100px" }}
                            >
                              {item.quantity}
                            </div>
                          </div>

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
                        for (const item of serveData.items) {
                          const servedQty = Number(item.serve_qty) || 0;
                          const stockQty = Number(item.products.stock) || 0;

                          if (servedQty > stockQty) {
                            Swal.fire({
                              icon: "error",
                              title: "Insufficient Stock",
                              html: `Item <b>${item.products.item_name}</b> only has <b>${stockQty}</b> in stock. You tried to serve <b>${servedQty}</b>.`,
                            });
                            return; // ⛔ Stop submit
                          }
                        }

                        // ✅ ADD: block submit if ALL served quantities are 0
                        const hasAnyServe = serveData.items.some(
                          (item) => (Number(item.serve_qty) || 0) > 0,
                        );

                        if (!hasAnyServe) {
                          Swal.fire({
                            icon: "warning",
                            iconColor: "#1E5A84",
                            title: "Nothing to Serve",
                            text: "Please enter a quantity to serve for at least one item.",
                            confirmButtonColor: "#246c9d",
                          });
                          return; // ⛔ Stop submit
                        }

                        // ✅ 3. Remove frontend-only fields (stock)
                        const servePayload = {
                          items: serveData.items
                            .filter(
                              (item) =>
                                (Number(item.serve_qty) || 0) > 0,
                            )
                            .map((item) => ({
                              order_item_id: item.id,
                              serve_qty: Number(item.serve_qty),
                            })),
                        };

                        console.log("Serve payload:", servePayload);

                        // ✅ 4. Submit serve request
                        const isAdmin = roleApprove?.toLowerCase() === "admin";
                        console.log(isAdmin);

                        if (isAdmin) {
                          await axios.post(
                            `${API_URL}/order/id/${selectedRow.id}/serve`,
                            servePayload,
                            { params: { roleApprove } },
                          );
                        } else {
                          await axios.post(
                            `${API_URL}/order/id/${selectedRow.id}/request`,
                            servePayload,
                            { params: { roleApprove } },
                          );
                        }

                        Swal.fire({
                          icon: "success",
                          title: isAdmin ? "Served" : "Requested",
                          text: isAdmin
                            ? "Serve data submitted successfully"
                            : "Serve request submitted successfully",
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
