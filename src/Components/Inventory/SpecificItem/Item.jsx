import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ItemDetails from "./ItemDetails";
import Tabs from "../InventoryTabs/Tabs";
import axios from "axios";

function Item({ onItemsUpdate }) {
  const location = useLocation();
  const { row: initialItem } = location.state || {};
  const [item, setItem] = useState(initialItem);

  const fetchItem = useCallback(async () => {
    if (!item?.itemCode) return;
    try {
      const response = await axios.get("/api/items");
      const updatedItem = response.data.find(
        (i) => i.itemCode === item.itemCode
      );

      if (!updatedItem) {
        console.error(`Item with code ${item.itemCode} not found after refetch.`);
        // Optionally, handle the case where the item is no longer found
        return;
      }

      // Update the state for the current details page
      setItem(updatedItem);

      // Call the callback to refetch the main item list in App.jsx
      if (onItemsUpdate) {
        onItemsUpdate();
      }
    } catch (error) {
      console.error("Failed to fetch updated item data:", error);
    }
  }, [item?.itemCode, onItemsUpdate]);

  
  return (
    <>
      <div className="row mt-3 mx-3">
        <div
          className="border rounded-3"
          style={{ height: "350px", backgroundColor: "#E8E7EC" }}
        >
          <ItemDetails item={item} onUpdate={fetchItem} />
        </div>
      </div>
      <div className="row mt-3 mx-3">
        <div
          className="border rounded-3"
          style={{ height: "335px", backgroundColor: "#E8E7EC" }}
        >
          <Tabs item={item} />
        </div>
      </div>
    </>
  );
}

export default Item;
