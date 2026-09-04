import { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomerTable from "./CustomerTable.jsx";
import { usePagination } from "../../hooks/usePagination";
import { IoIosSearch } from "react-icons/io";
import "../../styles/page.css";
import "../../styles/buttons.css";

const API_URL = import.meta.env.VITE_API_URL;

function Customer() {
  const customerTableRef = useRef(null);
  const { page, setPage, limit, setLimit, totalRows, setTotalRows } = usePagination();
  const [customers, setCustomers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
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
    <div className="page-container">
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
            onClick={ async () => {
              setPage(1);
              setSearch(searchInput);
              setSearchLoading(true);
              await fetchCustomers(searchInput);
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
              setClearLoading(true);
              await fetchCustomers();
              setClearLoading(false);
            }}
          >
            {clearLoading ? " Clearing..." : "Clear"}
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
