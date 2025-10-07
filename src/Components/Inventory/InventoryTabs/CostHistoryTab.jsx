import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";

function CostHistoryTab({ item }) {
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
        const response = await axios.get(`${API_URL}/inventory/cost-history`, {
          params: { itemCode },
        });
        console.log("Cost History Data:", response.data);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching cost history:", error);
        setData([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemCode]);

  // Define table columns
  const columns = [
    {
      id: 1,
      name: "PO #",
      selector: (row) => row.poNum,
      sortable: true,
      grow: 0.8,
      wrap: true,
    },
    {
      id: 2,
      name: "Date",
      selector: (row) => {
        if (!row.purchaseDate) return "";
        const date = new Date(row.purchaseDate);
        return `${date.getMonth() + 1}/${date.getDate()}/${String(
          date.getFullYear()
        ).slice(-2)}`;
      },
      sortable: true,
      grow: 0.8,
      wrap: true,
    },
    {
      id: 3,
      name: "Invoice ID",
      selector: (row) => row.invoiceID,
      sortable: true,
      grow: 1,
      wrap: true,
    },
    {
      id: 4,
      name: "Quantity",
      selector: (row) => row.quantity,
      sortable: true,
      grow: 0.8,
      wrap: true,
    },
    {
      id: 5,
      name: "Currency",
      selector: (row) => row.currency,
      sortable: true,
      grow: 0.8,
      wrap: true,
    },
    {
      id: 6,
      name: "Conversion Factor",
      selector: (row) => row.conversionFactor,
      sortable: true,
      wrap: true,
      grow: 1.2,
    },
    {
      id: 7,
      name: "Cost",
      selector: (row) => row.unitCost,
      sortable: true,
      wrap: true,
      grow: 1,
      cell: (row) =>
        row.unitCost
          ? `₱${parseFloat(row.unitCost).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}`
          : "",
    },
    {
      id: 8,
      name: "Supplier",
      selector: (row) => row.supplierName,
      sortable: false,
      wrap: true,
      grow: 2,
    },
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
        fixedHeaderScrollHeight="200px"
        customStyles={customStyles}
        dense
        defaultSortFieldId={1}
        defaultSortAsc={false}
      />
    </div>
  );
}

export default CostHistoryTab;
