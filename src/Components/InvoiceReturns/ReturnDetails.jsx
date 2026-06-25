import "../../styles/details-page.css";

export default function ReturnDetailsModal({ returnData, onClose }) {
  const invoice = returnData.sales_invoices;
  const items = returnData.sales_return_items || [];

  return (
    <div className="return-purchase-backdrop">
      <div className="return-purchase-modal">
        <div className="return-purchase-content">
          <div className="return-purchase-header">
            <div>
              <span>Return Details</span>
              <h5>{returnData.return_number}</h5>
            </div>

            <button className="return-close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="return-purchase-body">
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Order</label>
                <div className="form-control">
                  ORD-{String(invoice.order_id).padStart(4, "0")}
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Customer</label>
                <div className="form-control">
                  {invoice?.customers?.name ||
                    invoice?.customer?.name ||
                    "-"}
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Date</label>
                <div className="form-control">
                  {returnData.created_at
                    ? new Date(returnData.created_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })
                    : "-"}
                </div>
              </div>
              <div className="col-md-12">
                <label className="form-label">Reason</label>
                <div className="form-control">{returnData.reason || "-"}</div>
              </div>
            </div>

            <div className="return-items-table">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Product</th>
                    <th>Unit</th>
                    <th>Returned Qty</th>
                    <th>Remaining Qty</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No return items found
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const product =
                        item.products ||
                        item.sales_invoice_items?.products ||
                        {};

                      return (
                        <tr key={item.id}>
                          <td className="return-code">
                            {product.item_code || "-"}
                          </td>

                          <td>
                            <div className="return-product-name">
                              {product.item_name || "-"}
                            </div>
                          </td>

                          <td>{product.unit || "-"}</td>

                          <td>{item.return_qty ?? "-"}</td>

                          <td>
                            <span className="return-badge">
                              {item.remaining_qty ?? "-"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="return-purchase-footer">
            <button className="return-cancel-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}