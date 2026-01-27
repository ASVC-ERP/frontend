import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import axios from "axios";

function PhysicalCountTab({ item }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemCode = item?.itemCode || "";
  const itemId = item?.itemID || 0;

  const API_URL = import.meta.env.VITE_API_URL;

  const customStyles = {
    headCells: {
      style: {
        fontSize: "0.875rem",
        fontWeight: "600",
        color: "#1E5A84",
        paddingLeft: "8px",
        paddingRight: "8px",
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
          `${API_URL}/product/${itemId}/stock-adjustments`,
          {
            params: { itemId },
          }
        );
        console.log("Physical Count Data:", response.data);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching Physical Count:", error);
        setData([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  // Define table columns
 const columns = [
  {
    name: "From Quantity",
    selector: (row) => row.from_quantity,
    sortable: true,
    width: "150px", // fixed width
  },
  {
    name: "To Quantity",
    selector: (row) => row.to_quantity,
    sortable: true,
    width: "120px",
  },
  {
    name: "Adjusted Quantity",
    selector: (row) => row.adjusted_quantity,
    sortable: true,
    width: "150px",
  },
  {
    name: "Date",
    selector: (row) => row.created_at,
    sortable: true,
    width: "150px",
  },
  {
    name: "PIC",
    selector: (row) => row.pic,
    sortable: true,
    width: "150px",
  },
  {
    name: "Remarks",
    selector: (row) => row.remarks,
    sortable: true,
    cell: (row) => (
      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={row.remarks} // full text on hover
      >
        {row.remarks}
      </div>
    ),
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
        dense={true}
      />
    </div>
  );
}

export default PhysicalCountTab;
