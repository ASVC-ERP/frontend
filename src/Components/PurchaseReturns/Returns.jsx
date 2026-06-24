import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import ReturnDetailsModal from "./ReturnDetails";
import "../Purchases/Purchases.css";
import { IoIosSearch } from "react-icons/io";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReturnPurchase() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, [page, limit, name]);

  const fetchReturns = async (searchValue = search) => {
    try {
      const res = await axios.get(`${API_URL}/supplier-invoice/return`, { params: { page, limit, name: searchValue }, });
      console.log(res.data);
      setReturns(res.data.data || []);
      setTotalRows(res.data.meta?.total);
    } catch (err) {
      console.error("Failed to fetch supplier returns:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const columns = [
    {
      name: "Return No.",
      selector: (row) => `RET-${String(row.id).padStart(5, "0")}`,
      sortable: true,
      width: "140px",
    },
    {
      name: "Invoice No.",
      selector: (row) =>
        row.supplier_invoices?.invoice_number || "-",
      sortable: true,
      width: "140px",
    },
    {
      name: "PO No.",
      selector: (row) =>
        row.supplier_invoices?.po_number || "-",
      sortable: true,
      width: "140px",
    },
    {
      name: "Supplier",
      selector: (row) =>
        row.supplier_invoices?.suppliers?.name || "-",
      sortable: true,
      grow: 2,
    },
    {
      name: "Reason",
      selector: (row) => row.reason || "-",
      grow: 2,
      wrap: true,
    },
    {
      name: "Date",
      selector: (row) => formatDate(row.created_at),
      sortable: true,
      width: "150px",
    },
    {
      name: "Action",
      width: "140px",
      cell: (row) => (
        <button
          className="primary-btn"
          onClick={(e) => {
            e.stopPropagation();
    
            navigate(
              `/purchase/${row.supplier_invoices.id}`
            );
          }}
        >
          View Invoice
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
        <div className="page-title">Purchase Returns</div>
      </div>

      {/* TOOLBAR */}
      <div className="page-toolbar">

        <div className="search-group">
          <div className="search-input-wrapper">
            <IoIosSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search supplier name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            disabled={tableLoading}
            className="btn-primary-custom"
            onClick={async () => {
              if (searchInput !== "") {
                setSearch(searchInput);
                setSearchLoading(true);
                await fetchReturns(searchInput);
                setSearchLoading(false);
              }
            }}
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>

          <button
            disabled={tableLoading}
            className="btn-secondary-custom"
            onClick={async () => {
              setSearchInput("");
              setSearch("");
              setClearLoading(true);
              await fetchReturns("");
              setClearLoading(false);
            }}
          >
            {clearLoading ? "Clearing..." : "Clear"}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="custom-data-table-wrapper">
        <DataTable
          columns={columns}
          data={returns}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationRowsPerPageOptions={[2, 50, 100, 150, 200]}
          paginationPerPage={limit}
          paginationDefaultPage={page}
          onChangePage={(newPage) => setSearchParams({ page: newPage, limit }) }
          onChangeRowsPerPage={(newLimit) => setSearchParams({ page, limit: newLimit }) }
          highlightOnHover
          striped
          responsive
          persistTableHead
          fixedHeader
          fixedHeaderScrollHeight="650px"
          onRowClicked={(row) => setSelectedReturn(row)}
          className="custom-data-table"
          noDataComponent="No returns found"
        />
      </div>

      {selectedReturn && (  
        <ReturnDetailsModal
          returnData={selectedReturn}
          onClose={() => setSelectedReturn(null)}
        />
      )}
    </div>
  );
}