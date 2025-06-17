function ItemDetails({ item }) {
  console.log("ITEM", item);
  return (
    <div>
      {/* First Row */}
      <div className="row mx-4 d-flex align-items-start">
        <div className="col-4">
          <label htmlFor="pid" className="form-label h6">
            Product ID:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="pid"
            value={item.itemCode}
          />
        </div>
        <div className="col-4">
          <label htmlFor="size" className="form-label h6">
            Size:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="size"
            value={item.size}
          />
        </div>
        <div className="col-4">
          <label htmlFor="gPrice" className="form-label h6">
            Gross Price:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="gPrice"
            value={item.price.original}
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="row mx-4 mt-2 d-flex align-items-start">
        <div className="col-4">
          <label htmlFor="itemName" className="form-label h6">
            Item Name:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="itemName"
            value={item.itemName}
          />
        </div>
        <div className="col-4">
          <label htmlFor="model" className="form-label h6">
            Model:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="model"
            value={item.model}
          />
        </div>
        <div className="col-4">
          <label htmlFor="aPrice" className="form-label h6">
            Net-A Price:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="aPrice"
            value={item.price.markup1}
          />
        </div>
      </div>

      {/* Third Row */}
      <div className="row mx-4 mt-2 d-flex align-items-start">
        <div className="col-4">
          <label htmlFor="partNo" className="form-label h6">
            Part No.:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="partNo"
            value={item.partNo}
          />
        </div>
        <div className="col-4">
          <label htmlFor="category" className="form-label h6">
            Category:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="category"
            value={item.category}
          />
        </div>
        <div className="col-4">
          <label htmlFor="bPrice" className="form-label h6">
            Net-B Price:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="bPrice"
            value={item.price.markup2}
          />
        </div>
      </div>

      {/* Fourth Row */}
      <div className="row mx-4 mt-2 d-flex align-items-start">
        <div className="col-4">
          <label htmlFor="interchangeNo" className="form-label h6">
            Interchange No.:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="interchangeNo"
            value={item.interchangeNo}
          />
        </div>
        <div className="col-4">
          <label htmlFor="brand" className="form-label h6">
            Brand:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="brand"
            value={item.brand}
          />
        </div>
        <div className="col-4">
          <label htmlFor="sPrice" className="form-label h6">
            Special Price:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="sPrice"
            value={item.price.special}
          />
        </div>
      </div>

      {/* Final Row */}
      <div className="row mx-4 mt-2 d-flex align-items-start">
        <div className="col-4">
          <label htmlFor="unit" className="form-label h6">
            Unit:
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="unit"
            value={item.unit}
          />
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
