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

export default function ReturnSalesInvoice() {
  const navigate = useNavigate();

  const [returns, setReturns] = useState([]);
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
          className="btn-primary-custom"
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
    <div className="page-container page-container--fixed-table">
      <div className="page-header">
        <div>
          <div className="page-title">Sales Invoice Returns</div>
          <p className="page-subtitle">Track and manage items returned by your customers.</p>
        </div>
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
            disabled={loading}
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
              params.set("page", "1");
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
          onRowClicked={(row) => {
            debug("row: ",row)
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