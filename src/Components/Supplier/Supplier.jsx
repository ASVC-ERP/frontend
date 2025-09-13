import SupplierTable from "./SupplierTable";

function Supplier({ supplier, onAddSupplier }) {
  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="row align-items-center mx-2">
        {/* Title */}
        <div className="col-12 col-md-6">
          <p
            className="h3 h1-md fw-bold mb-2 mb-md-0"
            style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}
          >
            Suppliers
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="row mx-2 mt-3">
        <div className="col-12">
          <div className="table-responsive ">
            <SupplierTable supplier={supplier} onAddSupplier={onAddSupplier} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Supplier;
