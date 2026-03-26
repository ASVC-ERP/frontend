import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

/*
function SalesOrderHistoryTab({ itemCode }) {
*/
function SalesOrderHistoryTab({ item }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemId = item?.id || 0;

  const API_URL = import.meta.env.VITE_API_URL;

  const customStyles = {
    headCells: {
      style: {
        fontSize: "1rem",
        fontWeight: "600",
        color: "#1E5A84",
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
    cells: {
      style: {
        fontSize: "1rem",
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/order/${itemId}/serve-history`
        );
        //console.log("Sales Order Data:", response.data);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching Sales Order:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [itemId]);

  const columns = [
    { name: "Date", selector: (row) => row.order_date, sortable: true },
    { name: "Order ID", selector: (row) => row.order_id, sortable: true },
    {
      name: "Customer Name",
      selector: (row) => row.customer_name,
      sortable: true,
    },
    { name: "Price", selector: (row) => row.price, sortable: true }, //price from the order_items
    { name: "Quantity", selector: (row) => row.quantity, sortable: true },
    { name: "Served", selector: (row) => row.serve_qty , sortable: true }, //ordered_quantity - quantity_to_serve
    { name: "Unserved", selector: (row) => (row.quantity ?? 0) - (row.serve_qty ?? 0), sortable: true }, 
    { name: "Total Price", selector: (row) => (row.price ?? 0) * (row.quantity ?? 0), sortable: true }, //price * quantity_ordered
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        paginationRowsPerPageOptions={[50, 100]}
        paginationPerPage={50}
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="430px"
        customStyles={customStyles}
        dense
      />
    </div>
  );
}

export default SalesOrderHistoryTab;
