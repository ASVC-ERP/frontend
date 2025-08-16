import CustomerTable from "./CustomerTable.jsx";

function Customer({ customers }) {
  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center">
        <p
          className="h1 fw-bold mb-0 ms-3"
          style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}
        >
          Customers
        </p>
      </div>

      <div className="row table-responsive mx-3">
        <CustomerTable customers={customers} />
      </div>
    </div>
  );
}

export default Customer;
