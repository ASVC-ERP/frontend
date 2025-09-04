import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

function SalesOrderHistoryTab({ itemName }) {
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

  const [data, setData] = useState([]);

  // Fetch sales order history for the item when component mounts
  useEffect(() => {
    if (!itemName) return;

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
      }
    };

    fetchData();
  }, [itemName]);

  const columns = [
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
