import { useState, useEffect, useRef } from "react";
import axios from "axios";
import InventoryTable from "./InventoryTable";
import { usePagination } from "../../hooks/usePagination";
import { IoIosSearch } from "react-icons/io";

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
  const customerTableRef = useRef(null);
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
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
            Products
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
              onChange={(e) => setStock(e.target.value)}
            >
              <option value="">All</option>
              <option value="in">In Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          <button
            disabled={tableLoading}
            type="button"
            className="btn-primary-custom"
            onClick={ async () => {
              setPage(1);
              setSearch(searchInput);
              setSearchLoading(true);
              await fetchItems(searchInput, stock);
              setSearchLoading(false);
            }}
          >
            {searchLoading ? " Searching..." : "Search"}
          </button>

          <button
            disabled={tableLoading}
            type="button"
            className="btn-secondary-custom"
            onClick={ async () => {
              setPage(1);
              setSearchInput("");
              setSearch("");
              setClearLoading(true);
              await fetchItems();
              setClearLoading(false);
            }}
          >
            {clearLoading ? " Clearing..." : "Clear"}
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
