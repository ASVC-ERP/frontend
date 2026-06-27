import DataTable from "react-data-table-component";
import { useState, forwardRef, useImperativeHandle } from "react";
import { productColumns } from "./InventoryColumns";
import { useProductHandlers } from "./InventoryHandler";
import { useDraggableModal } from "../../hooks/useDraggableModal";
import "../../styles/modal.css"

const InventoryTable = forwardRef(function CustomerTable(
  {
    items = [],
    onRefreshItems = () => {},
    page,
    setPage,
    limit,
    setLimit,
    totalRows,
    progressPending, 
    progressComponent,
  },
  ref
) {

  const { handleHeaderMouseDown, handleMouseMove, handleMouseUp } = useDraggableModal();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  const {
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

    showItemModal,

    handleAddItemClick, handleCloseItemModal, handleSubmitItem, handleDeleteItem, handleRowClick,
  } = useProductHandlers( onRefreshItems, );

  useImperativeHandle(ref, () => ({
    openAddModal: handleAddItemClick,
  }));

  const columns = productColumns( handleDeleteItem );

  return (
    <div>
      <DataTable
        columns={columns}
        data={items}
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
        progressPending={progressPending}
        progressComponent={progressComponent}
      />

      {/* Add Item Modal */}

      {showItemModal && (
        <div
          className="app-modal-backdrop"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="app-modal app-modal-md">
            <div className="app-modal-content">
              <div
                className="app-modal-header cursor-move"
                onMouseDown={handleHeaderMouseDown}
              >
                <div>
                  <h5>Add New Product</h5>
                  <span>Create a new inventory product</span>
                </div>

                <button
                  type="button"
                  className="app-modal-close"
                  onClick={handleCloseItemModal}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="app-modal-body">
                <form className="modal-form">

                  {/* PRODUCT INFORMATION */}
                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Product Information
                    </div>

                    <div className="row g-3">
                      <div className="col-md-3 position-relative">
                        <label htmlFor="itemCode" className="form-label">
                          Product Code
                        </label>

                        <input
                          type="text"
                          id="itemCode"
                          placeholder="Enter code..."
                          value={itemCode}
                          onChange={(e) => {
                            setItemCode(e.target.value)
                            setShowSuggestions(true);
                          }}
                          className={`form-control ${isDuplicate ? "is-invalid" : ""}`}
                          required
                          onFocus={() => setShowSuggestions(true)}
                        />

                        {showSuggestions && itemCode && (
                          <div className="modal-suggestions">
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
                                  className="modal-suggestion-item"
                                  onClick={() => {
                                    setItemCode(p.itemCode);
                                    setShowSuggestions(false);
                                  }}
                                >
                                  {p.itemCode}
                                </div>
                              ))}
                          </div>
                        )}

                        {isDuplicate && (
                          <small className="modal-error-text">
                            This code already exists.
                          </small>
                        )}
                      </div>

                      <div className="col-md-9">
                        <label htmlFor="itemName" className="form-label">
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
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="brand" className="form-label">
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
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="origin" className="form-label">
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
                        />
                      </div>
                    </div>
                  </div>

                  {/* VEHICLE INFORMATION */}
                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Vehicle Information
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label htmlFor="partNum" className="form-label">
                          Part No.
                        </label>

                        <input
                          type="text"
                          id="partNum"
                          placeholder="Enter part number"
                          value={partNum}
                          onChange={(e) => setPartNum(e.target.value)}
                          className="form-control"
                        />
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="interNum" className="form-label">
                          Interchange No.
                        </label>

                        <input
                          type="text"
                          id="interNum"
                          placeholder="Enter interchange number"
                          value={interNum}
                          onChange={(e) => setInterNum(e.target.value)}
                          className="form-control"
                        />
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="model" className="form-label">
                          Model
                        </label>

                        <input
                          type="text"
                          id="model"
                          placeholder="Enter model"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  {/* INVENTORY SETTINGS */}
                  <div className="modal-form-section">
                    <div className="modal-form-section-title">
                      Inventory Settings
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="minimumStock" className="form-label">
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
                          onWheel={(e) => e.target.blur()}
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="unit" className="form-label">
                          Unit
                        </label>

                        <select
                          id="unit"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="form-select"
                        >
                          <option value="Pc">Pc</option>
                          <option value="Pcs">Pcs</option>
                          <option value="Set">Set</option>
                          <option value="Bundle">Bundle</option>
                          <option value="Roll">Roll</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              <div className="app-modal-footer">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={handleCloseItemModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn-primary-custom"
                  onClick={handleSubmitItem}
                  disabled={
                    !itemCode || !itemName || !brand || !origin || !minimumStock
                  }
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default InventoryTable;
