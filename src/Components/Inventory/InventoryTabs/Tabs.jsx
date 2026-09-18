import CostHistoryTab from "./CostHistoryTab";
import SalesOrderHistoryTab from "./SalesOrderHistoryTab";
import SalesInvoiceHistoryTab from "./SalesInvoiceHistoryTab";
import PhysicalCountTab from "./PhysicalCountTab";

import { useEffect, useState } from "react";

function Tabs({ item }) {
  const [activeTab, setActiveTab] = useState("tab1");

  const normalizeItem = (item) => ({
    id: item.itemID ?? item.id,
    itemCode: item.itemCode ?? item.item_code ?? "",
    itemName: item.itemName ?? item.item_name ?? "",
    partNum: item.partNum ?? item.part_num ?? "",
    interNum: item.interNum ?? item.internal_num ?? "",
    unit: item.unit ?? "",
    minStock: item.minStock ?? item.min_stock ?? "",
    origin: item.origin ?? "",
    model: item.model ?? "",
    brand: item.brand ?? "",
  });

  return (
    <div>
      <ul className="nav nav-tabs mt-2" id="item-details-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "tab1" ? "active" : ""}`}
            id="tab1-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab1"
            type="button"
            role="tab"
            onClick={() => setActiveTab("tab1")}
          >
            Cost History
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "tab2" ? "active" : ""}`}
            id="tab2-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab2"
            type="button"
            role="tab"
            onClick={() => setActiveTab("tab2")}
          >
            Sales Order History
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "tab3" ? "active" : ""}`}
            id="tab3-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab3"
            type="button"
            role="tab"
            onClick={() => setActiveTab("tab3")}
          >
            Sales Invoice History
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "tab4" ? "active" : ""}`}
            id="tab4-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab4"
            type="button"
            role="tab"
            onClick={() => setActiveTab("tab4")}
          >
            Physical Count
          </button>
        </li>
      </ul>

      <div className="tab-content">
        <div className={`tab-pane fade ${activeTab === "tab1" ? "show active" : ""}`}>
          <CostHistoryTab item={normalizeItem(item)} />
        </div>
        <div className={`tab-pane fade ${activeTab === "tab2" ? "show active" : ""}`}>
          <SalesOrderHistoryTab item={normalizeItem(item)} />
        </div>
        <div className={`tab-pane fade ${activeTab === "tab3" ? "show active" : ""}`}>
          <SalesInvoiceHistoryTab item={normalizeItem(item)} />
        </div>
        <div className={`tab-pane fade ${activeTab === "tab4" ? "show active" : ""}`}>
          <PhysicalCountTab item={normalizeItem(item)} />
        </div>
      </div>
    </div>
  );
}

export default Tabs;
