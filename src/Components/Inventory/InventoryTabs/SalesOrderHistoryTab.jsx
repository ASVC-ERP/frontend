import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

/*
function SalesOrderHistoryTab({ itemCode }) {
*/
function SalesOrderHistoryTab({ item }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemCode = item?.itemCode || "";

  const API_URL = import.meta.env.VITE_API_URL;

  const customStyles = {
    headCells: {
      style: {
        fontSize: "0.875rem",
        fontWeight: "600",
        color: "#0C1D61",
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!itemCode) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/inventory/sales-order-history`,
          {
            params: { itemCode },
          }
        );
        console.log("Sales Order Data:", response.data);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching Sales Order:", error);
        setData([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemCode]);

  const columns = [
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Order ID", selector: (row) => row.orderID, sortable: true },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
    },
    { name: "Price", selector: (row) => row.price, sortable: true },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true },
    { name: "Served", selector: (row) => row.served, sortable: true },
    { name: "Unserved", selector: (row) => row.unserved, sortable: true },
    { name: "Total Price", selector: (row) => row.totalPrice, sortable: true },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="400px"
        customStyles={customStyles}
        dense
      />
    </div>
  );
}

export default SalesOrderHistoryTab;
