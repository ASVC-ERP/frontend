import { useState, useEffect } from "react";
import axios from "axios";
import InvoiceTable from "./InvoiceTable";
import { usePagination } from "../../hooks/usePagination";

const API_URL = import.meta.env.VITE_API_URL;

function SalesInvoice() {

  const { page, setPage, limit, setLimit, totalRows, setTotalRows } = usePagination();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/customer`);
      setCustomers(res.data.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, limit, search]);

  const fetchInvoices = async (searchValue = search) => {
    try {
      setTableLoading(true);
      const response = await axios.get(`${API_URL}/invoice`, { params: { page, limit, search: searchValue, }, });
      setInvoices(response.data.data);
      setTotalRows(response.data.meta.total);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setTableLoading(false);
    }
  };
  
  const loadingText = search ? "Searching invoices..." : "Loading invoices...";

  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="row px-3 px-md-4">
        <div className="col-12">
          <p
            className="fw-bold fs-4 fs-md-2 mb-2"
            style={{ color: "#1E5A84", fontFamily: "'Outfit', sans-serif" }}
          >
            Invoices
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="row px-3 px-md-4 mb-3">
        <div className="col-auto">
          <input
            type="text"
            className="form-control"
            style={{ width: "450px" }}
            placeholder="Search Customer or Order No..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="col-auto d-flex gap-2">
          <button
            disabled={tableLoading}
            type="button"
            className="btn"
            onClick={ async () => {
              setPage(1);
              setSearch(searchInput);
              setSearchLoading(true);
              await fetchInvoices(searchInput);
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
            disabled={tableLoading}
            type="button"
            className="btn btn-secondary"
            onClick={ async () => {
              setPage(1);
              setSearchInput("");
              setSearch("");
              setClearLoading(true);
              await fetchInvoices("");
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
            <InvoiceTable
              invoices={invoices}
              fetchInvoices={fetchInvoices}
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
      </div>
    </div>
  );
}

export default SalesInvoice;
