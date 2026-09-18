import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import CustomerTable from "./CustomerTable.jsx";
import { IoIosSearch } from "react-icons/io";
import "../../styles/page.css";
import "../../styles/buttons.css";

const API_URL = import.meta.env.VITE_API_URL;

function Customer() {
  const customerTableRef = useRef(null);
  // Page/limit/search all live in the URL (not local state) so returning
  // via the browser Back button restores the page and search you were on.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);
  const search = searchParams.get("search") || "";
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
  const [searchInput, setSearchInput] = useState(search);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, search]);

  const fetchCustomers = async (searchValue = search) => {
    try {
      setTableLoading(true);
      const res = await axios.get(`${API_URL}/customer`, { params: { page, limit, search: searchValue, }, });
      setCustomers(res.data.data);
      setTotalRows(res.data.meta.total);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setTableLoading(false);
    }
  };

  const loadingText = search ? "Searching customers..." : "Loading customers...";

  return (
    <div className="page-container page-container--fixed-table">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
            Customers
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
                placeholder="Search Customer Name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
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
              updateParams({ page: 1, search: "" });
            }}
          >
            Clear
          </button>
        </div>

        <button
          type="button"
          className="btn-primary-custom"
          onClick={() => customerTableRef.current?.openAddModal()}
        >
          Create
        </button>
      </div>

      {/* Table Section */}
      <div className="custom-data-table-wrapper">
            <CustomerTable
              ref={customerTableRef}
              customers={customers}
              onRefreshCustomers={fetchCustomers}
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

export default Customer;
