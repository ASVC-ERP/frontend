import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

/*
function SalesOrderHistoryTab({ itemName }) {
*/
function SalesOrderHistoryTab({itemName}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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
    console.log("Fetching Sales Order for item:", itemName);
    const fetchData = async () => {
      if (!itemName) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/inventory/sales-order-history", {
          params: { itemName },
        });
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
  }, [itemName]);

/*
  // Fetch sales order history for the item when component mounts
  useEffect(() => {
    if (!itemName) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const encodedName = encodeURIComponent(itemName);
        const response = await axios.get(
          `http://localhost:3000/orders/item/${encodedName}`
        );
        setData(response.data);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemName]);
*/

  const columns = [
/*
    { name: "Date", selector: (row) => row.date, sortable: true },
    {
      name: "Sales Order No.",
      selector: (row) => row.orderID,
      sortable: true,
      width: "140px", // Ensure enough width
      cell: (row) => (
        <div style={{ whiteSpace: "nowrap" }}>{row.orderID}</div>
      ),
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
      width: "150px", // Ensure enough width
      cell: (row) => (
        <div style={{ whiteSpace: "nowrap" }}>{row.customerName}</div>
      ),
    },
    { name: "Unit Price", selector: (row) => row.price, sortable: true },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true },
    { name: "Packed Qty", selector: (row) => row.packedQty, sortable: true, minWidth: "110px"},
    {
      name: "Unserved Qty",
      selector: (row) => row.unservedQty,
      sortable: true,
      minWidth: "130px", // Ensure enough width
      cell: (row) => (
        <div style={{ whiteSpace: "nowrap" }}>{row.unservedQty}</div>
      ),
    },
    { name: "Discount 1", selector: (row) => row.dc1, sortable: true },
    { name: "Discount 2", selector: (row) => row.dc2, sortable: true,  minWidth: "110px",  },
    { name: "Agent", selector: (row) => row.salesAgent, sortable: true },
    {
      name: "Created By",
      selector: (row) => row.createdBy,
      sortable: true,  minWidth: "110px", 
    },
*/
    { name: "Date", selector: row => row.date, sortable: true },
    { name: "Order ID", selector: row => row.orderId, sortable: true },
    { name: "Customer Name", selector: row => row.customerName, sortable: true },
    { name: "Price", selector: row => row.price, sortable: true },
    { name: "Quantity", selector: row => row.quantity, sortable: true },
    { name: "Served", selector: row => row.served, sortable: true },
    { name: "Unserved", selector: row => row.unserved, sortable: true },
    { name: "Total Price", selector: row => row.totalPrice, sortable: true },
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
};

export default SalesOrderHistoryTab;
