import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";

function CostHistoryTab({item}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemName = item?.itemName || "";

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
    console.log("Fetching cost history for item:", itemName);
    const fetchData = async () => {
      if (!itemName) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/inventory/cost-history", {
          params: { itemName },
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
  }, [itemName]);

  // Define table columns
  const columns = [
    {
      id: 1,
      name: "Invoice #",
      selector: (row) => row.poNum,
      sortable: true,
    },
    {
      id: 2,
      name: "Invoice ID",
      selector: (row) => row.invoiceID,
      sortable: true,
    },
    {
      id: 3,
      name: "Quantity",
      selector: (row) => row.quantity,
      sortable: true,
      width: "100px",
    },
    {
      id: 4,
      name: "Currency",
      selector: (row) => row.currency,
      sortable: true,
      width: "100px",
    },
    {
      id: 5,
      name: "Conversion Factor",
      selector: (row) => row.conversionFactor,
      sortable: true,
      cell: (row) => row.conversionFactor,
    },
    {
      id: 6,
      name: "Cost",
      selector: (row) => row.unitCost,
      sortable: true,
      width: "75px",
      cell: (row) => row.unitCost,
    },
    {
      id: 7,
      name: "Price 1",
      selector: (row) => row.unitCost,
      sortable: false,
      width: "75px",
    },
    {
      id: 8,
      name: "Price 2",
      selector: (row) => row.unitCost,
      sortable: false,
      width: "75px",
    },
    {
      id: 9,
      name: "Price 3",
      selector: (row) => row.unitCost,
      sortable: false,
      width: "75px",
    },
    {
      id: 10,
      name: " Date",
      selector: (row) => row.purchaseDate,
      sortable: true,
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
