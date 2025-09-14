import CostHistoryTab from "./CostHistoryTab";
import SalesOrderHistoryTab from "./SalesOrderHistoryTab";
import PhysicalCountTab from "./PhysicalCountTab";

import { useEffect, useState } from "react";

function Tabs({ item }) {
  const [activeTab, setActiveTab] = useState("tab1");

  useEffect(() => {
    console.log("Tabs component received item:", item);
    console.log("Item Name:", item?.itemName);
  } );

  return (
    <div>
      <ul className="nav nav-tabs mt-2" id="item-details-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="tab1-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab1"
            type="button"
            role="tab"
            onClick={() => setActiveTab("tab1")}
            style={{
              backgroundColor: activeTab === "tab1" ? "#0C1D61" : "#ffffff",
              color: activeTab === "tab1" ? "white" : "#0C1D61",
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
              backgroundColor: activeTab === "tab2" ? "#0C1D61" : "#ffffff",
              color: activeTab === "tab2" ? "white" : "#0C1D61",
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
              backgroundColor: activeTab === "tab3" ? "#0C1D61" : "#ffffff",
              color: activeTab === "tab3" ? "white" : "#0C1D61",
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
              backgroundColor: activeTab === "tab4" ? "#0C1D61" : "#ffffff",
              color: activeTab === "tab4" ? "white" : "#0C1D61",
              border: activeTab === "tab4" ? "" : "1px solid #c9c9c9ad",
              whiteSpace: "nowrap",
            }}
          >
            Price History
          </button>
        </li> */}
      </ul>

      {/* tab content */}
      <div className="tab-content ">
        <div className="tab-pane fade show active" id="tab1" role="tabpanel">
          <CostHistoryTab item={item} />
        </div>
        <div className="tab-pane fade" id="tab2" role="tabpanel">
          <SalesOrderHistoryTab item={item}/>
        </div>
        <div className="tab-pane fade" id="tab3" role="tabpanel">
          <PhysicalCountTab item={item}/>
        </div>
      </div>
    </div>
  );
}

export default Tabs;
