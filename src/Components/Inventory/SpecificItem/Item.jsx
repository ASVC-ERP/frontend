import { useLocation } from "react-router-dom";
import ItemDetails from "./ItemDetails";
import Tabs from "../InventoryTabs/Tabs";

function Item () {
  const location = useLocation();
  const { row } = location.state || {};


  
  return (
    <>
      <div className="row mt-3 mx-3">
        <div
          className="border rounded-3"
          style={{ height: "350px", backgroundColor: "#E8E7EC" }}
        >
          <ItemDetails item={row} />
        </div>
      </div>
      <div className="row mt-3 mx-3">
        <div
          className="border rounded-3"
          style={{ height: "335px", backgroundColor: "#E8E7EC" }}
        >
          <Tabs />
        </div>
      </div>
    </>
  );
}

export default Item;
