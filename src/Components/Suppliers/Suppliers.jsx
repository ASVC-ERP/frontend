import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import EditSupplierModal from "./EditSupplierModal";
import { showLoadingSwal, showSuccessSwal, showErrorSwal, showWarningSwal, showConfirmSwal } from "../../utils/swal";
import "../../styles/buttons.css";
import "../../styles/page.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Suppliers() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);
  const [totalRows, setTotalRows] = useState(0);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const fetchSuppliers = async (q = search) => {
    setTableLoading(true);
    try {
      const res = await axios.get(`${API_URL}/supplier`, { params: { page, limit, search: q, }, });
      setSuppliers(res.data.data || res.data || []);
      setTotalRows(res.data.meta?.total);
    } catch (err) {
      console.error("Error fetching suppliers from backend:", err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers("");
  }, [page, limit, search]);

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setShowEditModal(true);
  };

  const columns = useMemo(
    () => [
      {
        name: "Supplier ID",
        selector: (row) => row.sid,
        sortable: true,
        width: "150px",
        center: true,
      },
      {
        name: "Supplier Name",
        cell: (row) => (
          <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
            {row.name || "-"}
          </div>
        ),
        sortable: true,
        wrap: true,
        grow: 2,
      },
      {
        name: "Address",
        cell: (row) => (
          <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
            {row.address || "-"}
          </div>
        ),
        grow: 2,
      },
      {
        name: "Currency",
        selector: (row) => row.currency || "-",
        width: "130px",
        center: true,
      },
      {
        name: "Number",
        cell: (row) => (
          <div style={{ width: "100%", textAlign: "left", pointerEvents: "none" }}>
            {row.number || "-"}
          </div>
        ),
        center: true,
        width: "200px"
      },
      {
        name: "Actions",
        cell: (row) => (
          <button
            className="btn-edit"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </button>
        ),
        width: "120px",
        center: true,
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      }
    ],
    []
  );

  const loadingText = search ? "Searching suppliers..." : "Loading suppliers...";

  return (
    <div className="page-container page-container--fixed-table">
      <>
        {/* HEADER */}
        <div className="page-header">
          <div className="page-title">Suppliers</div>
        </div>
    
        {/* TOOLBAR */}
        <div className="page-toolbar">
          <div className="search-group">
            <div className="search-input-wrapper">
              <IoIosSearch className="search-icon" />
    
              <input
                type="text"
                placeholder="Search supplier name or code..."
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
                  await fetchSuppliers(searchInput);
                  setSearchLoading(false);
                }
              }}
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
    
            <button
              className="btn-secondary-custom"
              onClick={async () => {
                setSearchInput("");
                setSearch("");
                setClearLoading(true);
                await fetchSuppliers("");
                setClearLoading(false);
              }}
              disabled={tableLoading}
            >
              {clearLoading ? "Clearing..." : "Clear"}
            </button>
          </div>

          <button
            className="btn-primary-custom"
            onClick={() => navigate("/suppliers/create")}
          >
            Add
          </button>
        </div>
    
        {/* TABLE */}
        <div className="custom-data-table-wrapper">
          <DataTable
            columns={columns}
            data={suppliers}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            paginationPerPage={limit}
            paginationDefaultPage={page}
            onChangePage={(newPage) => setSearchParams({ page: newPage, limit }) }
            onChangeRowsPerPage={(newLimit) => setSearchParams({ page, limit: newLimit }) }
            highlightOnHover
            pointerOnHover
            responsive
            striped
            fixedHeader
            fixedHeaderScrollHeight="100%"
            className="custom-data-table"
            noDataComponent="No suppliers found"
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
      </>
      <EditSupplierModal
        show={showEditModal}
        supplier={selectedSupplier}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSupplier(null);
        }}
        onSuccess={() => fetchSuppliers()}
      />
    </div>
  );
}