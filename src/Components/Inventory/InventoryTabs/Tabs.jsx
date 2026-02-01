import CostHistoryTab from "./CostHistoryTab";
import SalesOrderHistoryTab from "./SalesOrderHistoryTab";
import PhysicalCountTab from "./PhysicalCountTab";
import './Tabs.css';

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
/*
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
            style={{
              backgroundColor: activeTab === "tab1" ? "#1E5A84" : "#ffffff",
              color: activeTab === "tab1" ? "white" : "#1E5A84",
              border: activeTab === "tab1" ? "" : "1px solid #c9c9c9ad",
              whiteSpace: "nowrap",
            }}
          >
            Cost History
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="tab2-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab2"
            type="button"
            role="tab"
            onClick={() => setActiveTab("tab2")}
            style={{
              backgroundColor: activeTab === "tab2" ? "#1E5A84" : "#ffffff",
              color: activeTab === "tab2" ? "white" : "#1E5A84",
              border: activeTab === "tab2" ? "" : "1px solid #c9c9c9ad",
              whiteSpace: "nowrap",
            }}
          >
            Sales Order History
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="tab3-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab3"
            type="button"
            role="tab"
            onClick={() => setActiveTab("tab3")}
            style={{
              backgroundColor: activeTab === "tab3" ? "#1E5A84" : "#ffffff",
              color: activeTab === "tab3" ? "white" : "#1E5A84",
              border: activeTab === "tab3" ? "" : "1px solid #c9c9c9ad",
              whiteSpace: "nowrap",
            }}
          >
            Physical Count
          </button>
        </li>
        {/* <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="tab4-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab4"
            type="button"
            role="tab"
            onClick={() => setActiveTab("tab4")}
            style={{
              backgroundColor: activeTab === "tab4" ? "#1E5A84" : "#ffffff",
              color: activeTab === "tab4" ? "white" : "#1E5A84",
              border: activeTab === "tab4" ? "" : "1px solid #c9c9c9ad",
              whiteSpace: "nowrap",
            }}
          >
            Price History
          </button>
        </li> //}
      </ul>

      {/* tab content //}
      <div className="tab-content">
        <div
          className={`tab-pane fade ${activeTab === "tab1" ? "show active" : ""}`}
        >
          <CostHistoryTab item={normalizeItem(item)} />
        </div>
        <div
          className={`tab-pane fade ${activeTab === "tab2" ? "show active" : ""}`}
        >
          <SalesOrderHistoryTab item={normalizeItem(item)} />
        </div>
        <div
          className={`tab-pane fade ${activeTab === "tab3" ? "show active" : ""}`}
        >
          <PhysicalCountTab item={normalizeItem(item)} />
        </div>
      </div>
    </div>
  );
*/
  return (
    <div>
      <ul className="nav nav-tabs mt-2 item-details-tabs" id="item-details-tabs" role="tablist">
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
          <PhysicalCountTab item={normalizeItem(item)} />
        </div>
      </div>
    </div>
  );
}

export default Tabs;
