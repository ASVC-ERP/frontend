import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import ReturnDetailsModal from "./ReturnDetails";
import "../Purchases/Purchases.css";
import { IoIosSearch } from "react-icons/io";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReturnSalesInvoice() {
  const navigate = useNavigate();

  const [returns, setReturns] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);

  const [totalRows, setTotalRows] = useState(0);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, [page, limit, search]);

  const fetchReturns = async (searchValue = search) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/invoice/return`, {
        params: {
          page,
          limit,
          search: searchValue,
        },
      });

      setReturns(res.data.data || []);
      setTotalRows(res.data.meta?.total || 0);
    } catch (err) {
      console.error("Failed to fetch sales invoice returns:", err);
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
      selector: (row) => row.return_number,
      sortable: true,
      center: true,
      width: "150px",
    },
    {
      name: "Order",
      selector: (row) => `ORD${String(row.sales_invoices?.order_id).padStart(4, "0")}` || "-",
      sortable: true,
      center: true,
      width: "150px",
    },
    {
      name: "Customer",
      selector: (row) => row.sales_invoices?.customers?.name || "-",
      sortable: true,
      grow: 1,
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
      width: "150px",
      cell: (row) => (
        <button
          className="primary-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/invoices/${row.invoice_id}`);
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
      <div className="page-header">
        <div className="page-title">Sales Invoice Returns</div>
      </div>

      <div className="page-toolbar">
        <div className="search-group">
          <div className="search-input-wrapper">
            <IoIosSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search customer name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            disabled={loading}
            className="btn-primary-custom"
            onClick={ async() => {
              if (!searchInput.trim()) return;
              setSearch(searchInput);
              setSearchLoading(true);
              await fetchReturns(searchInput);
              setSearchLoading(false);
            }}
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>

          <button
            disabled={loading}
            className="btn-secondary-custom"
            onClick={() => {
              setSearchInput("");
              setSearch("");
            }}
          >
            {clearLoading ? "Clearing..." : "Clear"}
          </button>
        </div>
      </div>

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
          onChangePage={(newPage) =>
            setSearchParams({ page: newPage, limit })
          }
          onChangeRowsPerPage={(newLimit) =>
            setSearchParams({ page: 1, limit: newLimit })
          }
          highlightOnHover
          striped
          responsive
          persistTableHead
          fixedHeader
          fixedHeaderScrollHeight="650px"
          onRowClicked={(row) => {
            console.log("row: ",row)
            setSelectedReturn({
              id: row.id,
              reason: row.reason,
              created_at: row.created_at,
              invoice_id: row.invoice_id,
              return_number: row.return_number,
              sales_invoices: row.sales_invoices,
              sales_return_items:
                row.sales_return_items?.map((item) => ({
                  id: item.id,
                  return_id: item.return_id,
                  invoice_item_id: item.invoice_item_id,
                  return_qty: item.return_qty,
                  remaining_qty: item.remaining_qty,
                  products:
                    item.products ||
                    item.sales_invoice_items?.products ||
                    {},
                })) || [],
            });
          }}
          className="custom-data-table"
          noDataComponent="No sales invoice returns found"
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