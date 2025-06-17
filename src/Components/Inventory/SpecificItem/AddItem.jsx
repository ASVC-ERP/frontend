import { useNavigate } from "react-router-dom";
import { useState } from "react";

function AddItem({ onAddItem }) {
  const navigate = useNavigate();

  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [brand, setBrand] = useState("");
  const [origin, setOrigin] = useState("");
  const [stock, setStock] = useState("");
  const [original, setOriginal] = useState("");
  const [markup1, setMarkup1] = useState("");
  const [markup2, setMarkup2] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      itemCode: Number(itemCode),
      itemName,
      brand,
      origin,
      stock: Number(stock),
      price: {
        original: Number(original),
        markup1: Number(markup1),
        markup2: Number(markup2),
      },
      photo: "defaultPic"
    };
    

    console.log("Final Item Data:", newItem);
    // you can send it to the backend here

    onAddItem(newItem); 
    navigate("/inventory");
  };

  // Handle the cancel action
  const handleCancel = () => {
    navigate("/inventory"); // Navigate back to SalesOrder page
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="container mt-3">
          <div className="d-flex justify-content-between align-items-center">
            <p
              className="h1 fw-bold mb-0 ms-3"
              style={{ color: "#0C1D61", fontFamily: "'Outfit', sans-serif" }}
            >
              Add Item
            </p>
          </div>

          <div className="row mt-3 mx-3">
            <div
              className="border rounded-3 p-4"
              style={{ backgroundColor: "#E8E7EC" }}
            >
              <p
                className="h4 fw-bold"
                style={{ color: "#050505", fontFamily: "'Outfit', sans-serif" }}
              >
                Item Details
              </p>

              {/* Row 1 */}
              <div className="row mt-3">
                <div className="col-md-4">
                  <label htmlFor="itemCode" className="form-label h6">
                    Item Code:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="itemCode"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="itemName" className="form-label h6">
                    Item Name:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="itemName"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="brand" className="form-label h6">
                    Brand:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="row mt-3">
                <div className="col-md-4">
                  <label htmlFor="origin" className="form-label h6">
                    Origin:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="origin"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="stock" className="form-label h6">
                    Stock:
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    id="stock"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="originalPrice" className="form-label h6">
                    Original Price:
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    id="originalPrice"
                    value={original}
                    onChange={(e) => setOriginal(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="row mt-3">
                <div className="col-md-4">
                  <label htmlFor="netAPrice" className="form-label h6">
                    Net-A Price:
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    id="netAPrice"
                    value={markup1}
                    onChange={(e) => setMarkup1(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="netBPrice" className="form-label h6">
                    Net-B Price:
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    id="netBPrice"
                    value={markup2}
                    onChange={(e) => setMarkup2(e.target.value)}  
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 d-flex justify-content-end align-items-center">
            <button
              type="button"
              className="btn me-4"
              style={{ backgroundColor: "#B64345", color: "white" }}
              onClick={handleCancel} // Trigger navigation to SalesOrder page
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn me-5"
              style={{ backgroundColor: "#0C1D61", color: "white" }}
              disabled=""
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddItem;
