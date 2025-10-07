import InventoryTable from "./InventoryTable";

function Inventory({ items, onAddItem, onRefreshItems }) {
  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="row align-items-center px-3 px-md-4">
        <div className="col-12 col-md-6">
          <p
            className="fw-bold fs-4 fs-md-2 mb-2"
            style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}
          >
            Inventory
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="row px-3 px-md-4">
        <div className="col-12">
          <div className="table-responsive table-responsive-sm">
            <InventoryTable
              products={items}
              onAddItem={onAddItem}
              onRefreshItems={onRefreshItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
