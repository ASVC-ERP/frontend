import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import OrdersTable from "./OrdersTable.jsx";
import { usePagination } from "../../hooks/usePagination";

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
      console.log(search, status)
      const res = await axios.get(`${API_URL}/order`, { params: { page, limit, search: searchValue, status: statusFilter }, });
      setOrders(res.data.data);
      setTotalRows(res.data.meta.total);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="row align-items-center px-3 px-md-4">
        <div className="col-12 col-md-6">
          <p
            className="fw-bold fs-4 fs-md-2 mb-2"
            style={{ color: "#1E5A84", fontFamily: "'Outfit', sans-serif" }}
          >
            Orders
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="row px-3 px-md-4 mb-3">
        <div className="col-auto">
          <input
            type="text"
            className="form-control"
            style={{ width: "400px" }}
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="col-auto">
        <select
          className="form-select"
          style={{
            width: "200px",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #ced4da",
            backgroundColor: "#fff",
            color: "#495057",
            fontSize: "14px",
            height: "38px",
          }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Served">Served</option>
          <option value="Invoiced">Invoiced</option>
        </select>
      </div>

        <div className="col-auto d-flex gap-2">
          <button
            type="button"
            className="btn"
            onClick={ async () => {
              setPage(1);
              setSearch(searchInput);
              setSearchLoading(true);
              await fetchOrders(searchInput, status);
              setSearchLoading(false);
            }}
            style={{ backgroundColor: "#1E5A84", color: "white", whiteSpace: "nowrap", }}
          >
            {searchLoading && (
              <span className="spinner-border spinner-border-sm"></span>
            )}
            {searchLoading ? " Searching..." : "Search"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={ async () => {
              setPage(1);
              setSearchInput("");
              setSearch("");
              setStatus("");
              setClearLoading(true);
              await fetchOrders("", "");
              setClearLoading(false);
            }}
            style={{ whiteSpace: "nowrap" }}
          >
            {clearLoading && (
              <span className="spinner-border spinner-border-sm"></span>
            )}
            {clearLoading ? " Clearing..." : "Clear"}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="row px-3 px-md-4 ">
        <div className="col-12">
          <div className="table-responsive table-responsive-sm">
            <OrdersTable 
              orders={orders}
              fetchOrders={fetchOrders}
              customers={customers}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              totalRows={totalRows}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesOrder;
