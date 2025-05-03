import { useLocation } from "react-router-dom";
import ItemDetails from "./ItemDetails";

function Item() {
  const location = useLocation();
  const { row } = location.state || {};
  console.log(row);
  
  return (
    <>
      <div className="row mt-3 mx-3">
        <div
          className="border rounded-3"
          style={{ height: "400px", backgroundColor: "#E8E7EC" }}
        >
          <p
            className="h4 fw-bold mt-2 ms-3"
            style={{ color: "#050505", fontFamily: "'Outfit', sans-serif" }}
          >
            Item Details
          </p>
          <ItemDetails item={row} />
        </div>
      </div>

      
    </>
  );
}

export default Item;
