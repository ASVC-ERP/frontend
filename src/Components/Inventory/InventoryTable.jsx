import DataTable from "react-data-table-component";
import { IoIosSearch } from "react-icons/io";
import { productColumns } from "./InventoryColumns";
import { useProductHandlers } from "./InventoryHandler";
import { useDraggableModal } from "../../hooks/useDraggableModal";

function InventoryTable({
  items = [],
  onAddItem = () => {},
  onRefreshItems = () => {},
  page,
  setPage,
  limit,
  setLimit,
  totalRows,
}) {

  const { handleHeaderMouseDown, handleMouseMove, handleMouseUp } = useDraggableModal();

  const {
    // Search state
    searchTerm, setSearchTerm,
    filteredData, handleSearch,
    
    // Item form state
    itemCode, setItemCode,
    itemName, setItemName,
    brand, setBrand,
    minimumStock, setMinimumStock,
    partNum, setPartNum,
    interNum, setInterNum,
    unit, setUnit,
    model, setModel,
    origin, setOrigin,
    isDuplicate,
    
    // Modal state
    showItemModal, setShowItemModal,
    
    // Handlers
    handleAddItemClick, handleCloseItemModal, handleSubmitItem, handleDeleteItem, handleRowClick, handleFileUpload,

  } = useProductHandlers(items, onAddItem, onRefreshItems, );

  const columns = productColumns( handleDeleteItem );

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between ">
        {/* Search input field */}
        <div className="position-relative w-25 my-3">
          <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input
            type="text"
            placeholder="Search item code or name"
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
              backgroundColor: "#0C1D61",
              color: "white",
              whiteSpace: "nowrap",
            }}
            onClick={handleAddItemClick}
          >
            + Add Item
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
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
        fixedHeaderScrollHeight="700px"
        onRowClicked={handleRowClick}
        className="custom-data-table"
      />

      {/* Add Item Modal */}
      <div
        className={`modal fade ${showItemModal ? "show" : ""}`}
        tabIndex="-1"
        style={{ display: showItemModal ? "block" : "none" }}
        aria-hidden={!showItemModal}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg w-50">
          <div className="modal-content shadow-lg border-0">
            {/* Header with gradient background */}
            <div
              className="modal-header text-white position-relative overflow-hidden cursor-move"
              style={{
                background: "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
                borderRadius: "0.5rem 0.5rem 0 0",
              }}
              onMouseDown={handleHeaderMouseDown}
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
                Add Product
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
