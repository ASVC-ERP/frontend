import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import axios from "axios";

function SalesOrderHistoryTab({item}) {
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

  // Define table columns
  const columns = [
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
  ];

  //   const [searchTerm, setSearchTerm] = useState("");
  //   const [filteredData, setFilteredData] = useState(Object.values(data));

  // Handle search input change
  //   const handleSearch = (event) => {
  //     const value = event.target.value.toLowerCase();
  //     setSearchTerm(value);

  //     const filtered = Object.values(data).filter((row) =>
  //       Object.values(row).some((field) =>
  //         field?.toString().toLowerCase().includes(value)
  //       )
  //     );

  //     setFilteredData(filtered);
  //   };

  return (
    <div>
      {/* <div className="d-flex justify-content-between align-items-center">
        Search input field
        <div className="position-relative w-25 my-3">
          <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input
            type="text"
            placeholder="Search inventory"
            value={searchTerm}
            onChange={handleSearch}
            className="form-control ps-5 border-2 rounded-3"
          />
        </div>
      </div> */}

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

export default SalesOrderHistoryTab;
