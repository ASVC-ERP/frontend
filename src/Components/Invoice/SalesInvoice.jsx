import InvoiceTable from "./InvoiceTable";

function SalesInvoice({ invoices, onfetchInvoices }) {
  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="row px-3 px-md-4">
        <div className="col-12">
          <p
            className="fw-bold fs-4 fs-md-2 mb-2"
            style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}
          >
            Sales Invoice
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="row">
        <div className="col-12">
          <div className="table-responsive table-responsive-sm">
            <InvoiceTable invoices={invoices} fetchInvoices={onfetchInvoices} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesInvoice;
