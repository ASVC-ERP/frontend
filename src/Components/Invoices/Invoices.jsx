import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import "../../styles/page.css";
import "../../styles/buttons.css"

const API_URL = import.meta.env.VITE_API_URL;

function SalesInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    fetchInvoices();
  }, [page, limit, search]);

  const fetchInvoices = async (searchValue = search) => {
    try {
      setTableLoading(true);

      const response = await axios.get(`${API_URL}/invoice`, {
        params: {
          page,
          limit,
          search: searchValue,
        },
      });

      setInvoices(response.data.data);
      setTotalRows(response.data.meta.total);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleClear = () => {
    setPage(1);
    setSearchInput("");
    setSearch("");
  };

  const loadingText = search ? "Searching invoices..." : "Loading invoices...";

  const columns = [
    {
      name: "Invoice No.",
      selector: (row) => row.invoice_number,
      sortable: true,
      center: true,
    },
    {
      name: "Order No.",
      selector: (row) =>
        `ORD${String(row.order_id).padStart(4, "0")}`,
      center: true,
    },
    {
      name: "Date",
      selector: (row) =>
        new Date(row.invoice_date).toLocaleDateString(),
      center: true,
    },
    {
      name: "Customer",
      selector: (row) => row.customer?.name,
      sortable: true,
      grow: 2,
    },
    {
      name: "Amount",
      selector: (row) =>
        `₱${Number(row.total_price).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}`,
      right: true,
    },
    {
      name: "PIC",
      selector: (row) => row.user?.name,
      center: true,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
          <div className="page-title">Invoices</div>
      </div>

      <div className="page-toolbar">
        <div className="search-group">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search customer or order no..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>

          <button
            disabled={tableLoading}
            className="btn-primary-custom"
            onClick={handleSearch}
          >
            Search
          </button>

          <button
            disabled={tableLoading}
            className="btn-secondary-custom"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="custom-data-table-wrapper">
        <DataTable
          className="custom-data-table"
          columns={columns}
          data={invoices}
          pagination
          paginationServer
          paginationPerPage={limit}
          paginationTotalRows={totalRows}
          onChangePage={(newPage) =>
            setSearchParams({ page: newPage, limit })
          }
          onChangeRowsPerPage={(newLimit) =>
            setSearchParams({ page, limit: newLimit })
          }
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          responsive
          fixedHeader
          fixedHeaderScrollHeight="700px"
          progressPending={tableLoading}
          progressComponent={
            <div className="table-loader">
              <div className="spinner-border table-loader-spinner" />
              <div className="table-loader-text">
                {loadingText}
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

export default SalesInvoices;