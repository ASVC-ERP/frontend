import { useState, useEffect } from "react";
import axios from "axios";
import CustomerTable from "./CustomerTable.jsx";
import { usePagination } from "../../hooks/usePagination";

const API_URL = import.meta.env.VITE_API_URL;

function Customer() {
  const { page, setPage, limit, setLimit, totalRows, setTotalRows } = usePagination();
  const [customers, setCustomers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, search]);

  const fetchCustomers = async (searchValue = search) => {
    try {
      const res = await axios.get(`${API_URL}/customer`, { params: { page, limit, search: searchValue, }, });
      setCustomers(res.data.data);
      setTotalRows(res.data.meta.total);
    } catch (err) {
      console.error("Error fetching customers:", err);
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
            Customers
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

        <div className="col-auto d-flex gap-2">
          <button
            type="button"
            className="btn"
            onClick={ async () => {
              setPage(1);
              setSearch(searchInput);
              setSearchLoading(true);
              await fetchCustomers(searchInput);
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
              setClearLoading(true);
              await fetchCustomers();
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
      <div className="row px-3 px-md-4">
        <div className="col-12">
          <div className="table-responsive table-responsive-sm">
            <CustomerTable
              customers={customers}
              onRefreshCustomers={fetchCustomers}
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

export default Customer;
