import CostHistoryTab from "./CostHistoryTab";
import SalesOrderHistoryTab from "./SalesOrderHistoryTab";
import PhysicalCountTab from "./PhysicalCountTab";
import PriceHistoryTab from "./PriceHistoryTab";

function Tabs() {
  return (
    <div>
      <ul className="nav nav-tabs" id="item-details-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="tab1-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab1"
            type="button"
            role="tab"
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
          >
            Physical Count
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="tab4-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab4"
            type="button"
            role="tab"
          >
            Price History
          </button>
        </li>
      </ul>

      {/* tab content */}
      <div className="tab-content p-3">
        <div className="tab-pane fade show active" id="tab1" role="tabpanel">
          <CostHistoryTab />    
        </div>
        <div className="tab-pane fade" id="tab2" role="tabpanel">
          Content for Tab 2
        </div>
        <div className="tab-pane fade" id="tab3" role="tabpanel">
          Content for Tab 3
        </div>
        <div className="tab-pane fade" id="tab4" role="tabpanel">
          Content for Tab 3
        </div>
      </div>
    </div>
  );
}

export default Tabs;
