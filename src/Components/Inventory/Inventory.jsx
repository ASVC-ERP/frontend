import { useState, useEffect } from "react";
import axios from "axios";
import InventoryTable from "./InventoryTable";
import { usePagination } from "../../hooks/usePagination";

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
});

function Inventory() {
  const { page, setPage, limit, setLimit, totalRows, setTotalRows } = usePagination();
  const [items, setItems] = useState([]);
  const [stock, setStock] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [page, limit, search, stock]);

  const fetchItems = async (searchValue = search, stockValue = stock) => {
    try {
      setTableLoading(true);
      const response = await axios.get(`${API_URL}/product`, { params: { page, limit, search: searchValue, stock: stockValue, }, });
      const transformedItems = response.data.data.map(transformItem);
      setItems(transformedItems);
      setTotalRows(response.data.meta.total);
    } catch (error) { console.error("Error fetching items from backend:", error);
    } finally { setTableLoading(false); }
  };

  const loadingText = search ? "Searching products..." : "Loading products...";

  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="row align-items-center px-3 px-md-4">
        <div className="col-12 col-md-6">
          <p
            className="fw-bold fs-4 fs-md-2 mb-2"
            style={{ color: "#1E5A84", fontFamily: "'Outfit', sans-serif" }}
          >
            Products
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
            placeholder="Search Code, Description, Brand, Model or Origin..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            style={{
              width: "200px",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
              backgroundColor: "#fff",
              color: "#495057",
              fontSize: "14px",
              height: "38px",
            }}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          >
            <option value="">All</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        {/* Stock filter */}

        <div className="col-auto d-flex gap-2">
          <button
            disabled={tableLoading}
            type="button"
            className="btn"
            onClick={ async () => {
              setPage(1);
              setSearch(searchInput);
              setSearchLoading(true);
              await fetchItems(searchInput, stock);
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
              await fetchItems();
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

      <div className="row px-3 px-md-4">
        <div className="col-12">
          <div className="table-responsive table-responsive-sm">
            <InventoryTable
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
      </div>
    </div>
  );
}

export default Inventory;
