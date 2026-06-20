import "../Purchases/ReturnPurchase.css";

export default function ReturnDetailsModal({ returnData, onClose }) {
  const invoice = returnData.supplier_invoices;
  const items = returnData.supplier_return_items || [];

  return (
    <div className="return-purchase-backdrop">
      <div className="return-purchase-modal">
        <div className="return-purchase-content">
          <div className="return-purchase-header">
            <div>
              <span>
                Return Details
              </span>
              <h5> RET-{String(returnData.id).padStart(5, "0")}</h5>
            </div>

            <button className="return-close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="return-purchase-body">
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label">PO Number</label>
                <div className="form-control">{invoice?.po_number || "-"}</div>
              </div>
              <div className="col-md-3">
                <label className="form-label">Invoice Number</label>
                <div className="form-control">{invoice?.invoice_number || "-"}</div>
              </div>

              <div className="col-md-3">
                <label className="form-label">Supplier</label>
                <div className="form-control">
                  {invoice?.suppliers?.name || "-"}
                </div>
              </div>

              <div className="col-md-3">
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
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className="return-code">
                          {item.products?.item_code || "-"}
                        </td>
                        <td>
                          <div className="return-product-name">
                            {item.products?.item_name || "-"}
                          </div>
                        </td>
                        <td>{item.products?.unit || "-"}</td>
                        <td>{item.ret_qty}</td>
                        <td>
                          <span className="return-badge">
                            {item.rem_qty}
                          </span>
                        </td>
                      </tr>
                    ))
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