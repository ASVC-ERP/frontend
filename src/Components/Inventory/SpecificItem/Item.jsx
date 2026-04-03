import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ItemDetails from "./ItemDetails";
import Tabs from "../InventoryTabs/Tabs";
import axios from "axios";

function Item() {
  const location = useLocation();
  const { row: initialItem } = location.state || {};
  const [item, setItem] = useState(initialItem);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchItem = useCallback(async () => {
    if (!item?.itemCode) return;
    try {
      const response = await axios.get( `${API_URL}/product/id/${item.itemID}` );
      setItem(response.data);
      console.log("fetch: ",response.data)
    } catch (error) {
      console.error("Failed to fetch updated item data:", error);
    }
  }, [item?.itemCode]);
  
  return (
    <>
      <div className="row mt-3 mx-3">
        <div
          className="border rounded-3"
          style={{ height: "330px", backgroundColor: "#E8E7EC" }}
          >
            <ItemDetails item={item} onUpdate={fetchItem} />
        </div>
      </div>
      <div className="row mt-3 mx-3">
        <div
          className="border rounded-3"
          style={{ height: "570px", backgroundColor: "#E8E7EC" }}
        >
          <Tabs item={item} />
        </div>
      </div>
    </>
  );
}

export default Item;
