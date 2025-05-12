import DataTable from "react-data-table-component";

function PhysicalCountTab() {
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

  const data = [
    {
      fromQuantity: 100,
      toQuanty: 90,
      adjQuantity: -10,
      date: "2025-05-12",
      pic: "John Doe",
      remarks: "Damaged during storage",
    },
    {
      fromQuantity: 200,
      toQuanty: 210,
      adjQuantity: 10,
      date: "2025-05-11",
      pic: "Jane Smith",
      remarks: "Stock replenished",
    },
    {
      fromQuantity: 150,
      toQuanty: 145,
      adjQuantity: -5,
      date: "2025-05-10",
      pic: "Michael Lee",
      remarks: "Minor discrepancies",
    },
    {
      fromQuantity: 300,
      toQuanty: 320,
      adjQuantity: 20,
      date: "2025-05-09",
      pic: "Sarah Connor",
      remarks: "New stock received",
    },
    {
      fromQuantity: 400,
      toQuanty: 395,
      adjQuantity: -5,
      date: "2025-05-08",
      pic: "David Miller",
      remarks: "Shrinkage during transfer",
    },
    {
      fromQuantity: 500,
      toQuanty: 500,
      adjQuantity: 0,
      date: "2025-05-07",
      pic: "Emily Clark",
      remarks: "Stock counted, no changes",
    },
    {
      fromQuantity: 600,
      toQuanty: 610,
      adjQuantity: 10,
      date: "2025-05-06",
      pic: "Robert King",
      remarks: "Extra stock identified",
    },
    {
      fromQuantity: 700,
      toQuanty: 690,
      adjQuantity: -10,
      date: "2025-05-05",
      pic: "Alice Johnson",
      remarks: "Stock adjustment due to error",
    },
    {
      fromQuantity: 800,
      toQuanty: 800,
      adjQuantity: 0,
      date: "2025-05-04",
      pic: "Charlie Brown",
      remarks: "Stock verified, no changes",
    },
    {
      fromQuantity: 900,
      toQuanty: 890,
      adjQuantity: -10,
      date: "2025-05-03",
      pic: "Olivia White",
      remarks: "Damaged items removed",
    },
  ];

  // Define table columns
  const columns = [
    {
      name: "From Quantity",
      selector: (row) => row.fromQuantity,
      sortable: true,
    },
    { name: "To Quantity", selector: (row) => row.toQuanty, sortable: true },
    {
      name: "Adjusted Quantity",
      selector: (row) => row.adjQuantity,
      sortable: true,
    },
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "PIC", selector: (row) => row.pic, sortable: true },
    { name: "Remarks", selector: (row) => row.remarks, sortable: true },
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
