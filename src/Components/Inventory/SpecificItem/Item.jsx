import { useState, useCallback, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import ItemDetails from "./ItemDetails";
import Tabs from "../InventoryTabs/Tabs";
import PageLoader from "../../PageLoader";
import axios from "axios";
import { debug } from "../../../utils/log";
import "../../../styles/details-page.css";
import "../../../styles/modal.css";
import "../../../styles/buttons.css";

function Item() {
  const { itemID } = useParams();
  const location = useLocation();
  const { row: initialItem } = location.state || {};
  const [item, setItem] = useState(initialItem);

  const API_URL = import.meta.env.VITE_API_URL;

  // Keyed off the URL's :itemID (always present on this route), not
  // item?.itemCode — that guard made this a no-op whenever the page was
  // reached without router state (a direct link, or a refresh), leaving
  // `item` undefined and crashing ItemDetails instead of loading the item.
  const fetchItem = useCallback(async () => {
    if (!itemID) return;
    try {
      const response = await axios.get( `${API_URL}/product/id/${itemID}` );
      setItem(response.data);
      debug("fetch: ",response.data)
    } catch (error) {
      console.error("Failed to fetch updated item data:", error);
    }
  }, [itemID]);

  // Without router state (a direct link or a refresh), `item` starts out
  // undefined — fetch it ourselves instead of waiting on ItemDetails'
  // own onUpdate-on-mount effect, which runs too late: ItemDetails reads
  // itemData synchronously during its first render, before any effect
  // fires, so it would still crash on that first pass.
  useEffect(() => {
    if (!item) fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemID]);

  if (!item) {
    return <PageLoader />;
  }

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
