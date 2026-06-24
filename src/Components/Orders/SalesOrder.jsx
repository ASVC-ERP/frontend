import { useState, useEffect } from "react";
import axios from "axios";
import OrdersTable from "./OrdersTable.jsx";
import { Link } from "react-router-dom";
import { usePagination } from "../../hooks/usePagination";
import { IoIosSearch } from "react-icons/io";

const API_URL = import.meta.env.VITE_API_URL;

function SalesOrder() {

  const { page, setPage, limit, setLimit, totalRows, setTotalRows } = usePagination();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
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
    <div className="page-container">
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
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Served">Served</option>
              <option value="Invoiced">Invoiced</option>
            </select>
          </div>

          <button
            disabled={tableLoading}
            type="button"
            className="btn-primary-custom"
            onClick={ async () => {
              setPage(1);
              setSearch(searchInput);
              setSearchLoading(true);
              await fetchOrders(searchInput, status);
              setSearchLoading(false);
            }}
          >
            {searchLoading ? " Searching..." : "Search"}
          </button>

          <button
            disabled={tableLoading}
            type="button"
            className="btn-secondary-custom"
            onClick={ async () => {
              setPage(1);
              setSearchInput("");
              setSearch("");
              setStatus("");
              setClearLoading(true);
              await fetchOrders("", "");
              setClearLoading(false);
            }}
          >
            {clearLoading ? " Clearing..." : "Clear"}
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
