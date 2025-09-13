import InvoiceTable from "./InvoiceTable";

function SalesInvoice({ invoices, onfetchInvoices }) {
  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="row mx-2">
        <div className="col-12">
          <p
            className="h3 h1-md fw-bold mb-2"
            style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}
          >
            Sales Invoice
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="row mx-2 mt-3">
        <div className="col-12">
          <div className="table-responsive">
            <InvoiceTable invoices={invoices} fetchInvoices={onfetchInvoices} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesInvoice;
