import DataTable from "react-data-table-component";
import { useState, useEffect } from "react";
import axios from "axios";

function PhysicalCountTab({item}) {
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
    console.log("Fetching physical count for item:", itemName);
    const fetchData = async () => {
      if (!itemName) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/inventory/physical-count", {
          params: { itemName },
        });
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
  }, [itemName]);

  // Define table columns
  const columns = [
    {
      name: "From Quantity",
      selector: (row) => row.fromQuantity,
      sortable: true,
    },
    { name: "To Quantity", selector: (row) => row.toQuantity, sortable: true },
    {
      name: "Adjusted Quantity",
      selector: (row) => row.adjustedQuantity,
      sortable: true,
    },
    { name: "Date", selector: (row) => row.Date, sortable: true },
    { name: "PIC", selector: (row) => row.PIC, sortable: true },
    { name: "Remarks", selector: (row) => row.Remarks, sortable: true },
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

export default PhysicalCountTab;
