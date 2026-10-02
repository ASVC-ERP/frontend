import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import InventoryTable from "./InventoryTable";
import { IoIosSearch } from "react-icons/io";
import "../../styles/page.css";
import "../../styles/buttons.css";

const API_URL = import.meta.env.VITE_API_URL;

const transformItem = (item) => ({
  itemID: item.id,
  itemCode: item.item_code,
  itemName: item.item_name,
  brand: item.brand,
  origin: item.origin,
  stock: item.stock,
  price1: item.price1,
  price2: item.price2,
  price3: item.price3,
  price4: item.price4,
  minStock: item.min_stock,
  cost: item.cost,
  partNum: item.part_num,
  interNum: item.internal_num,
  unit: item.unit,
  model: item.model,
  status: item.status,
});

function Inventory() {
  const customerTableRef = useRef(null);
  // Page/limit/search/stock all live in the URL (not local state) so
  // returning via the browser Back button from a product's detail page
  // restores the page, search text, and filter you were on.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);
  const search = searchParams.get("search") || "";
  const stock = searchParams.get("stock") || "";
  const status = searchParams.get("status") || "";
  // Reads window.location.search (not the "prev" argument) because
  // callers sometimes fire two updates back-to-back — the functional
  // updater's "prev" lags a render behind, so the second call would
  // silently undo the first. The browser URL itself is already up to
  // date by then (history updates are synchronous), so this isn't.
  const updateParams = (updates) => {
    const next = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  };
  const setPage = (newPage) => updateParams({ page: newPage });
  const setLimit = (newLimit) => updateParams({ limit: newLimit });
  const [totalRows, setTotalRows] = useState(0);
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState(search);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [page, limit, search, stock, status]);

  const fetchItems = async (searchValue = search, stockValue = stock, statusValue = status) => {
    try {
      setTableLoading(true);
      const response = await axios.get(`${API_URL}/product`, { params: { page, limit, search: searchValue, stock: stockValue, status: statusValue, }, });
      const transformedItems = response.data.data.map(transformItem);
      setItems(transformedItems);
      setTotalRows(response.data.meta.total);
    } catch (error) { console.error("Error fetching items from backend:", error);
    } finally { setTableLoading(false); }
  };

  const loadingText = search ? "Searching products..." : "Loading products...";

  return (
    <div className="page-container page-container--fixed-table">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <p className="page-subtitle">Manage your product catalog and stock levels.</p>
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
                placeholder="Search Code, Description, Brand, Model or Origin..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
          </div>

          <div className="select-wrapper">
            <select
              className="search-select"
              value={stock}
              onChange={(e) => updateParams({ stock: e.target.value })}
            >
              <option value="">All Stock</option>
              <option value="in">In Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          <div className="select-wrapper">
            <select
              className="search-select"
              value={status}
              onChange={(e) => updateParams({ status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            disabled={tableLoading}
            type="button"
            className="btn-primary-custom"
            onClick={() => updateParams({ page: 1, search: searchInput })}
          >
            Search
          </button>

          <button
            disabled={tableLoading}
            type="button"
            className="btn-secondary-custom"
            onClick={() => {
              setSearchInput("");
              updateParams({ page: 1, search: "", stock: "", status: "" });
            }}
          >
            Clear
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

      <div className="custom-data-table-wrapper">
        <InventoryTable
          ref={customerTableRef}
          items={items}
          onRefreshItems={fetchItems}
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

export default Inventory;
