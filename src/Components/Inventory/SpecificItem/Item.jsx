import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ItemDetails from "./ItemDetails";
import Tabs from "../InventoryTabs/Tabs";
import axios from "axios";
import { debug } from "../../../utils/log";

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
      debug("fetch: ",response.data)
    } catch (error) {
      console.error("Failed to fetch updated item data:", error);
    }
  }, [item?.itemCode]);
  
  return (
    <div className="details-page">
      <ItemDetails item={item} onUpdate={fetchItem} />
  
      <div className="item-tabs-wrapper">
        <Tabs item={item} />
      </div>
    </div>
  );
}

export default Item;
