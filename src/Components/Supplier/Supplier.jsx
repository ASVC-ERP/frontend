import { useState, useEffect } from "react";
import axios from "axios";
import SupplierTable from "./SupplierTable";
import { usePagination } from "../../hooks/usePagination";

const API_URL = import.meta.env.VITE_API_URL;

const transformSupplier = (supplier) => ({
  id: supplier.id,
  sid: supplier.sid,
  name: supplier.name,
  address: supplier.address,
  currency: supplier.currency,
  number: supplier.number,
});

function Supplier() {
  const { page, setPage, limit, setLimit, totalRows, setTotalRows } = usePagination();
  const [suppliers, setSuppliers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  
  useEffect(() => {
    fetchSuppliers();
  }, [page, limit, search]);

  const fetchSuppliers = async (searchValue = search) => {
    try {
      setTableLoading(true);
      const response = await axios.get(`${API_URL}/supplier`, { params: { page, limit, search: searchValue, }, });
      const transformedSuppliers = response.data.data.map(transformSupplier);
      setSuppliers(transformedSuppliers);
      setTotalRows(response.data.meta.total);
    } catch (error) {
      console.error("Error fetching suppliers from backend:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const loadingText = search ? "Searching suppliers..." : "Loading suppliers...";

  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="row align-items-center px-3 px-md-4">
        <div className="col-12 col-md-6">
          <p
            className="fw-bold fs-4 fs-md-2 mb-2"
            style={{ color: "#1E5A84", fontFamily: "'Outfit', sans-serif" }}
          >
            Suppliers
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
            placeholder="Search Supplier Name..."
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
              await fetchSuppliers(searchInput);
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
              await fetchSuppliers();
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
      <div className="row px-3 px-md-4 ">
        <div className="col-12">
          <div className="table-responsive table-responsive-sm">
            <SupplierTable
              suppliers={suppliers}
              onRefreshSupplier={fetchSuppliers}
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

export default Supplier;
