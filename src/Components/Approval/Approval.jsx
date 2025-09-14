import ApprovalTables from "./ApprovalTables.jsx";

function Approval({ supplier }) {
  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="row px-3 px-md-4">
        <div className="col-12">
          <p
            className="fw-bold fs-4 fs-md-2 mb-2"
            style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}
          >
            Approvals
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="row px-3 px-md-4 mt-3">
        <div className="col-12">
          <div className="table-responsive table-responsive-sm">
            <ApprovalTables supplier={supplier} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Approval;
