import { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import Swal from "sweetalert2";
import axios from "axios";

function InventoryTable({
  items = [],
  onAddItem = () => {},
  onRefreshItems = () => {},
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [brand, setBrand] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [partNum, setPartNum] = useState("");
  const [interNum, setInterNum] = useState("");
  const [unit, setUnit] = useState("Pc");
  const [model, setModel] = useState("");
  const [origin, setOrigin] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);

  const [showItemModal, setShowItemModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const columns = [
    {
      name: "Product Code",
      selector: (row) => row.itemCode,
      sortable: true,
      grow: 2,
      minWidth: "150px",
    },
    {
      name: "Product Name",
      selector: (row) => row.itemName,
      sortable: true,
      grow: 3,
      minWidth: "200px",
      wrap: true,
    },
    {
      name: "Brand",
      selector: (row) => row.brand,
      sortable: true,
      grow: 1, // smaller
      maxWidth: "120px",
    },
    {
      name: "Origin",
      selector: (row) => row.origin,
      sortable: true,
      grow: 1,
    },
    {
      name: "Stock",
      selector: (row) => row.stock,
      sortable: true,
      grow: 1,
      maxWidth: "80px",
      center: true,
    },
    {
      name: "Price",
      selector: (row) => row.price1 ?? 0,
      sortable: true,
      grow: 1,
      maxWidth: "100px",
      right: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              console.log("Row data:", row);
              handleDeleteItem(row.id);
            }}
          >
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      grow: 0,
      maxWidth: "100px",
      center: true,
    },
  ];

  useEffect(() => {
    // 🔄 Load cached search term on mount
    const cachedSearch = localStorage.getItem("searchTerm");
    if (cachedSearch) {
      setSearchTerm(cachedSearch);
    }
  }, []);

  useEffect(() => {
    // ✅ When products change, re-apply search if active
    if (searchTerm.trim() !== "") {
      const filtered = Object.values(items).filter((row) =>
        Object.values(row).some((field) =>
          field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(Object.values(items));
    }
  }, [items, searchTerm]);

  // 🕒 Auto-refresh only when not searching
  useEffect(() => {
    if (searchTerm.trim() !== "") return; // ⛔ Pause refresh if searching

    const interval = setInterval(() => {
      onRefreshItems();
    }, 120000);

    return () => clearInterval(interval);
  }, [onRefreshItems, searchTerm]);

  // 🔍 Handle search input change
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    localStorage.setItem("searchTerm", value);

    const filtered = Object.values(products).filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  useEffect(() => {
    const checkDuplicate = async () => {
      if (!itemCode.trim()) {
        setIsDuplicate(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/items/check-code?itemCode=${encodeURIComponent(
            itemCode
          )}`
        );
        setIsDuplicate(response.data.exists);
      } catch (error) {
        console.error("Error checking item code:", error);
      }
    };

    const delay = setTimeout(checkDuplicate, 400);
    return () => clearTimeout(delay);
  }, [itemCode]);

  const handleAddItemClick = () => {
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    setShowItemModal(false);
    // Clear form fields when closing
    setItemCode("");
    setItemName("");
    setBrand("");
    setOrigin("");
    setMinimumStock("");
    setPartNum("");
    setInterNum("");
    setUnit("Pc");
    setModel("");
  };

  const handleSubmitItem = async () => {
    if (!itemCode || !itemName) return;

    const trimmedItem = {
      item_code: itemCode.trim(),
      item_name: itemName.trim(),
      brand: brand.trim(),
      origin: origin.trim(),
      min_stock: minimumStock || 0,
      part_num: partNum.trim(),
      internal_num: interNum.trim(),
      unit: unit.trim(),
      model: model.trim(),
    };

    if (
      !trimmedItem.item_code ||
      !trimmedItem.item_name ||
      !trimmedItem.brand ||
      !trimmedItem.origin ||
      trimmedItem.min_stock === null ||
      trimmedItem.min_stock === undefined ||
      !trimmedItem.part_num ||
      !trimmedItem.internal_num ||
      !trimmedItem.unit ||
      !trimmedItem.model
    ) {
      Swal.fire({
        text: "Please fill in all item details.",
        icon: "warning",
        confirmButtonColor: "#1E5A84",
      });
      return;
    }

    const newItem = {
      ...trimmedItem,
      min_stock: Number(trimmedItem.min_stock),
      stock: Number(0),
      cost: Number(0),
      price1: Number(0),
      price2: Number(0),
      price3: Number(0),
      price4: Number(0),
    };

    try {
      console.log("New Item:", newItem);
      const success = await onAddItem(newItem);
      console.log("onAddItem returned:", success);

      if (success) {
        // Reset inputs only if added successfully
        setItemCode("");
        setItemName("");
        setBrand("");
        setOrigin("");
        setMinimumStock("");
        setPartNum("");
        setInterNum("");
        setUnit("Pc");
        setModel("");

        // ✅ Close modal
        handleCloseItemModal();
      } else {
        Swal.fire({
          text: "Failed to add item. Item code already exist.",
          icon: "error",
          confirmButtonColor: "#1E5A84",
        });
      }
    } catch (error) {
      console.error("Error adding item:", error);
      Swal.fire({
        text: "An error occurred while adding the item.",
        icon: "error",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This item will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(`${API_URL}/items/${id}`);

        Swal.fire({
          title: "Deleted!",
          text: "Item has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#1E5A84",
        });

        onRefreshItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to delete item.",
        icon: "error",
        confirmButtonColor: "#1E5A84",
      });
    }
  };

  const handleRowClick = (row) => {
    console.log("CLICKED", row); // Log the clicked row data
    navigate("/inventory/item", { state: { row } }); // Navigate to the details page with the selected row data
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/items/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Imported!",
        text: response.data.message || "Items imported successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh items table
      onRefreshItems();
    } catch (error) {
      console.error("Error importing items:", error);
      const errMsg = error.response?.data?.message || error.message;
      Swal.fire({
        icon: "error",
        title: "Import failed",
        text: errMsg,
      });
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between ">
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

        {/* Add + Import Buttons beside each other */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: "#1E5A84",
              color: "white",
              whiteSpace: "nowrap",
            }}
            onClick={handleAddItemClick}
          >
            + Add Item
          </button>

          <label
            htmlFor="fileUpload"
            className="btn"
            style={{
              backgroundColor: "#198754",
              color: "white",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            📂 Import
          </label>
          <input
            type="file"
            id="fileUpload"
            accept=".xlsx"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>
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

      {/* Add Item Modal */}
      <div
        className={`modal fade ${showItemModal ? "show" : ""}`}
        tabIndex="-1"
        style={{ display: showItemModal ? "block" : "none" }}
        aria-hidden={!showItemModal}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg w-50">
          <div className="modal-content shadow-lg border-0">
            {/* Header with gradient background */}
            <div
              className="modal-header text-white position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                borderRadius: "0.5rem 0.5rem 0 0",
              }}
            >
              <div className="d-flex align-items-center">
                <div>
                  <h5 className="modal-title mb-0">Add New Product</h5>
                  <small className="opacity-75">
                    Create a new inventory product
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white p-4"
                onClick={handleCloseItemModal}
                aria-label="Close"
              ></button>

              {/* Decorative elements */}
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

            <div className="modal-body p-4">
              <form>
                <div className="row g-3">
                  {/* Row 1 */}
                  <div className="col-md-3 position-relative">
                    <label
                      htmlFor="itemCode"
                      className="form-label fw-semibold text-muted small d-flex align-items-center gap-2"
                    >
                      <i
                        className="fas fa-qrcode"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Product Code
                    </label>

                    <div className="position-relative">
                      <input
                        type="text"
                        id="itemCode"
                        placeholder="Enter code..."
                        value={itemCode}
                        onChange={(e) => setItemCode(e.target.value)}
                        className="form-control"
                        required
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "0.5rem",
                          fontSize: "0.85rem",
                          paddingRight: "2rem",
                          transition: "border-color 0.3s ease",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#1E5A84")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />

                      {/* Dropdown Icon inside Input */}
                      <i
                        className="fas fa-chevron-down position-absolute"
                        style={{
                          right: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#adb5bd",
                          fontSize: "0.8rem",
                          pointerEvents: "none",
                        }}
                      />
                    </div>

                    {/* Read-only Suggestions */}
                    {itemCode && (
                      <div
                        className="position-absolute bg-white border rounded shadow-sm mt-1"
                        style={{
                          zIndex: 1051,
                          maxHeight: "150px",
                          overflowY: "auto",
                          width: "100%",
                        }}
                      >
                        {Object.values(items)
                          .filter((p) =>
                            p.itemCode
                              .toLowerCase()
                              .includes(itemCode.toLowerCase())
                          )
                          .slice(0, 5)
                          .map((p) => (
                            <div
                              key={p.itemCode}
                              className="px-3 py-2 text-secondary"
                              style={{
                                fontSize: "0.85rem",
                                userSelect: "none",
                                background: "white",
                              }}
                            >
                              {p.itemCode}
                            </div>
                          ))}
                      </div>
                    )}

                    {isDuplicate && (
                      <small className="text-danger mt-1 d-block">
                        ⚠️ This code already exists.
                      </small>
                    )}
                  </div>

                  <div className="col-md-9">
                    <label
                      htmlFor="itemName"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-box me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="itemName"
                      placeholder="Enter product name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="form-control"
                      required
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.90rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="col-md-4">
                    <label
                      htmlFor="partNum"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-cogs me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Part No.
                    </label>
                    <input
                      type="text"
                      id="partNum"
                      placeholder="Enter part number"
                      value={partNum}
                      onChange={(e) => setPartNum(e.target.value)}
                      className="form-control"
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.90rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  <div className="col-md-4">
                    <label
                      htmlFor="interNum"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-random me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Interchange No.
                    </label>
                    <input
                      type="text"
                      id="interNum"
                      placeholder="Enter interchange number"
                      value={interNum}
                      onChange={(e) => setInterNum(e.target.value)}
                      className="form-control"
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.90rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  <div className="col-md-4">
                    <label
                      htmlFor="model"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-car me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Model
                    </label>
                    <input
                      type="text"
                      id="model"
                      placeholder="Enter model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="form-control"
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.90rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="col-md-3">
                    <label
                      htmlFor="brand"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-tag me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Brand
                    </label>
                    <input
                      type="text"
                      id="brand"
                      placeholder="Enter brand name"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="form-control"
                      required
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.90rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  <div className="col-md-3">
                    <label
                      htmlFor="origin"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-globe me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Origin
                    </label>
                    <input
                      type="text"
                      id="origin"
                      placeholder="Enter origin"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="form-control"
                      required
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.90rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  <div className="col-md-3">
                    <label
                      htmlFor="minimumStock"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-exclamation-triangle me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Minimum Stock
                    </label>
                    <input
                      type="number"
                      id="minimumStock"
                      placeholder="Enter min stock"
                      value={minimumStock}
                      onChange={(e) => setMinimumStock(e.target.value)}
                      className="form-control"
                      min="0"
                      required
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.90rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    />
                  </div>

                  <div className="col-md-3">
                    <label
                      htmlFor="unit"
                      className="form-label fw-semibold text-muted small"
                    >
                      <i
                        className="fas fa-balance-scale me-2"
                        style={{ color: "#1E5A84" }}
                      ></i>
                      Unit
                    </label>
                    <select
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="form-select"
                      style={{
                        border: "1px solid #e9ecef",
                        borderRadius: "0.5rem",
                        fontSize: "0.90rem",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1E5A84")}
                      onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                    >
                      <option value="Pc">Pc</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Set">Set</option>
                      <option value="Bundle">Bundle</option>
                      <option value="Roll">Roll</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer bg-light border-0 rounded-bottom">
              <button
                type="button"
                className="btn px-4 py-2 me-2"
                onClick={handleCloseItemModal}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#c82333";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#dc3545";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <i className="fas fa-times me-2"></i>
                Cancel
              </button>
              <button
                type="button"
                className="btn px-4 py-2"
                onClick={handleSubmitItem}
                disabled={
                  !itemCode || !itemName || !brand || !origin || !minimumStock
                }
                style={{
                  backgroundColor:
                    !itemCode || !itemName || !brand || !origin || !minimumStock
                      ? "#6c757d"
                      : "#1E5A84",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  cursor:
                    !itemCode || !itemName || !brand || !origin || !minimumStock
                      ? "not-allowed"
                      : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (
                    !(
                      !itemCode ||
                      !itemName ||
                      !brand ||
                      !origin ||
                      !minimumStock
                    )
                  ) {
                    e.target.style.backgroundColor = "#1e3c72";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    !(
                      !itemCode ||
                      !itemName ||
                      !brand ||
                      !origin ||
                      !minimumStock
                    )
                  ) {
                    e.target.style.backgroundColor = "#1E5A84";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop for Add Item */}
      {showItemModal && (
        <div
          className="modal-backdrop fade show"
          onClick={handleCloseItemModal}
        ></div>
      )}
    </div>
  );
}

export default InventoryTable;
