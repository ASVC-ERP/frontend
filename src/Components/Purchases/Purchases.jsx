import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import "./Purchases.css"

const API_URL = import.meta.env.VITE_API_URL;

/* Convert nested invoices → 1 row per invoice */
const transformInvoices = (invoices) => {
  return invoices.map((inv) => {
    const supplierName = inv.suppliers.name;
    const productCount = inv.supplier_invoice_items.length;
    const totalQty = inv.supplier_invoice_items.reduce( (sum, i) => sum + i.quantity, 0 );
    const totalAmount = inv.supplier_invoice_items.reduce( (sum, i) => sum + i.subtotal, 0 );
    return {
      id: inv.id,
      invoice_number: inv.invoice_number,
      po_number: inv.po_number,
      purchase_date: inv.purchase_date,
      status: inv.status,
      supplier_name: supplierName,
      product_count: productCount,
      total_qty: totalQty,
      total_amount: totalAmount,
    };
  });
};

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);
  const [totalRows, setTotalRows] = useState(0);

  /* FETCH DATA (Bun-compatible) */
  useEffect(() => {
    fetchData();
  }, [page, limit, name]);

  const fetchData = async (searchValue = search) => {
    try {  
      setTableLoading(true);
      const res = await axios.get(`${API_URL}/supplier-invoice`, { params: { page, limit, name: searchValue }, });
      const json = res.data;
      const transformed = transformInvoices(json.data || []);
      setData(transformed);
      setFilteredData(transformed);
      setTotalRows(json.meta?.total || transformed.length);
    } catch (error) {
      console.error("Error fetching suppliers from backend:", error);
    } finally {
      setTableLoading(false);
    }
  };

  /* TABLE COLUMNS (1 ROW PER INVOICE) */
  const columns = useMemo(
    () => [
      {
        name: "Status",
        cell: (row) => (
          <span className={`status-badge status-${row.status?.toLowerCase()}`}>
            {row.status}
          </span>
        ),
        width: "150px",
        center: true,
      },
      {
        name: "Supplier",
        cell: (row) => (
          <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
            {row.supplier_name || "N/A"}
          </div>
        ),
        center: true,
        width: "300px",
      },
      {
        name: "Invoice No",
        selector: (row) => row.invoice_number,
        center: true,
      },
      {
        name: "PO No",
        selector: (row) => row.po_number,
        center: true,
      },
      {
        name: "Date",
        selector: (row) => row.purchase_date,
        center: true,
      },
      {
        name: "No. of Products",
        selector: (row) => row.product_count,
        center: true,
      },
      {
        name: "Total Qty",
        selector: (row) => row.total_qty,
        center: true,
      },
      {
        name: "Total Amount",
        cell: (row) => `₱${row.total_amount.toLocaleString()}`,
        center: true,
      },
    ],
    []
  );

  const loadingText = search ? "Searching purchases..." : "Loading purchases...";

  return (
    <div className="page-container">

      {/* HEADER BAR */}
      <div className="page-header">
        <div className="page-title">Purchases</div>
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
                await fetchData(searchInput);
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
              await fetchData("");
              setClearLoading(false);
            }}
          >
            {clearLoading ? "Clearing..." : "Clear"}
          </button>
        </div>

        <Link to="/create-purchase">
          <button className="btn-primary-custom">
            Create
          </button>
        </Link>
      </div>

      {/* TABLE WRAPPER */}
      <div className="custom-data-table-wrapper">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationRowsPerPageOptions={[1, 50, 100, 150, 200]}
          paginationPerPage={limit}
          paginationDefaultPage={page}
          onChangePage={(newPage) => setSearchParams({ page: newPage, limit }) }
          onChangeRowsPerPage={(newLimit) => setSearchParams({ page, limit: newLimit }) }
          persistTableHead
          highlightOnHover
          pointerOnHover
          fixedHeader
          fixedHeaderScrollHeight="650px"
          className="custom-data-table"
          onRowClicked={(row) => navigate(`/purchase/${row.id}`)}
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