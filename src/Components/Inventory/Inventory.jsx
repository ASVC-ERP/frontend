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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [page, limit, search]);

  const fetchItems = async (searchValue = search) => {
    try {
      const response = await axios.get(`${API_URL}/product`, { params: { page, limit, search: searchValue, }, });
      const transformedItems = response.data.data.map(transformItem);
      setItems(transformedItems);
      setTotalRows(response.data.meta.total);
    } catch (error) { console.error("Error fetching items from backend:", error); }
  };

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
            style={{ width: "400px" }}
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="col-auto d-flex gap-2">
          <button
            type="button"
            className="btn"
            onClick={ async () => {
              setPage(1);
              setSearch(searchInput);
              setSearchLoading(true);
              await fetchItems(searchInput);
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
