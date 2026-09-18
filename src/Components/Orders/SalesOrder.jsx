import { useState, useEffect } from "react";
import axios from "axios";
import OrdersTable from "./OrdersTable.jsx";
import { Link, useSearchParams } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import "../../styles/page.css";
import "../../styles/buttons.css";

const API_URL = import.meta.env.VITE_API_URL;

function SalesOrder() {

  // Page/limit/search/status all live in the URL (not local state) so
  // returning via the browser Back button from an order's detail page
  // restores the page, search text, and filter you were on.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  // Reads window.location.search (not the "prev" argument) because
  // callers sometimes fire two updates back-to-back — the functional
  // updater's "prev" lags a render behind, so the second call would
  // silently undo the first. The browser URL itself is already up to
  // date by then (history updates are synchronous), so this isn't.
  const updateParams = (updates) => {
    const next = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  };
  const setPage = (newPage) => updateParams({ page: newPage });
  const setLimit = (newLimit) => updateParams({ limit: newLimit });
  const [totalRows, setTotalRows] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchInput, setSearchInput] = useState(search);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/customer`);
      setCustomers(res.data.data);
    } catch (err) { console.error("Error fetching customers:", err); }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit, search, status]);

  const fetchOrders = async (searchValue = search, statusFilter = status) => {
    try {
      setTableLoading(true);
      const res = await axios.get(`${API_URL}/order`, { params: { page, limit, search: searchValue, status: statusFilter }, });
      setOrders(res.data.data);
      setTotalRows(res.data.meta.total);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setTableLoading(false);
    }
  };

  const loadingText = search ? "Searching orders..." : "Loading orders...";

  return (
    <div className="page-container page-container--fixed-table">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          Orders
        </div>
      </div>

      {/* Search */}
      <div className="page-toolbar">
        <div className="search-group">
          <div className="search-input-wrapper">
            <IoIosSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by Order No. or Customer Name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
          </div>

          {/* Status filter */}
          <div className="select-wrapper">
            <select
              className="search-select"
              value={status}
              onChange={(e) => updateParams({ status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="For Approval">For Approval</option>
              <option value="Served">Served</option>
              <option value="Invoiced">Invoiced</option>
              
            </select>
          </div>

          <button
            disabled={tableLoading}
            type="button"
            className="btn-primary-custom"
            onClick={() => updateParams({ page: 1, search: searchInput })}
          >
            Search
          </button>

          <button
            disabled={tableLoading}
            type="button"
            className="btn-secondary-custom"
            onClick={() => {
              setSearchInput("");
              updateParams({ page: 1, search: "", status: "" });
            }}
          >
            Clear
          </button>
        </div>

        <Link to="/create-order">
          <button
            type="button"
            className="btn-primary-custom"
          >
            Create
          </button>
        </Link>
      </div>

      {/* Table Section */}
      <div className="custom-data-table-wrapper">
        <OrdersTable 
          orders={orders}
          fetchOrders={fetchOrders}
          customers={customers}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalRows={totalRows}
          progressPending={tableLoading}
          progressComponent={
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
              }}
            >
              <div
                className="spinner-border"
                style={{
                  color: "#1E5A84",
                  width: "2.5rem",
                  height: "2.5rem",
                }}
              />
              <div
                style={{
                  marginTop: "10px",
                  color: "#6c757d",
                  fontWeight: "600",
                }}
              >
                {loadingText}
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

export default SalesOrder;
