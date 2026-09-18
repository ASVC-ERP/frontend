import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import ReturnDetailsModal from "./ReturnDetails";
import "../../styles/page.css";
import "../../styles/buttons.css";
import { IoIosSearch } from "react-icons/io";
import { debug } from "../../utils/log";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReturnPurchase() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);
  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, [page, limit, search]);

  const fetchReturns = async (searchValue = search) => {
    try {
      const res = await axios.get(`${API_URL}/supplier-invoice/return`, { params: { page, limit, name: searchValue }, });
      debug(res.data);
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
      wrap: true,
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
          className="btn-primary-custom"
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
    <div className="page-container page-container--fixed-table">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="page-title">Purchase Returns</div>
          <p className="page-subtitle">Track and manage items returned to your suppliers.</p>
        </div>
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
            onClick={() => {
              setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                if (searchInput.trim()) {
                  params.set("search", searchInput);
                } else {
                  params.delete("search");
                }
                params.set("page", "1");
                return params;
              });
            }}
          >
            Search
          </button>

          <button
            disabled={tableLoading}
            className="btn-secondary-custom"
            onClick={() => {
              setSearchInput("");
              setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.delete("search");
                params.set("page", "1");
                return params;
              });
            }}
          >
            Clear
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
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          paginationPerPage={limit}
          paginationDefaultPage={page}
          onChangePage={(newPage) =>
            setSearchParams((prev) => {
              const params = new URLSearchParams(prev);
              params.set("page", newPage);
              return params;
            })
          }
          onChangeRowsPerPage={(newLimit) =>
            setSearchParams((prev) => {
              const params = new URLSearchParams(prev);
              params.set("page", page);
              params.set("limit", newLimit);
              return params;
            })
          }
          highlightOnHover
          striped
          responsive
          persistTableHead
          fixedHeader
          fixedHeaderScrollHeight="100%"
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