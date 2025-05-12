import DataTable from "react-data-table-component";

function PriceHistoryTab() {
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
    gPrice: "100.00",
    bPrice: "90.00",
    aPrice: "85.00",
    sPrice: "80.00",
    updatedBy: "John Doe",
    updatedDate: "2025-05-12",
  },
  {
    gPrice: "150.00",
    bPrice: "135.00",
    aPrice: "130.00",
    sPrice: "125.00",
    updatedBy: "Jane Smith",
    updatedDate: "2025-05-11",
  },
  {
    gPrice: "200.00",
    bPrice: "180.00",
    aPrice: "175.00",
    sPrice: "170.00",
    updatedBy: "Michael Lee",
    updatedDate: "2025-05-10",
  },
  {
    gPrice: "250.00",
    bPrice: "225.00",
    aPrice: "220.00",
    sPrice: "215.00",
    updatedBy: "Sarah Connor",
    updatedDate: "2025-05-09",
  },
  {
    gPrice: "300.00",
    bPrice: "270.00",
    aPrice: "265.00",
    sPrice: "260.00",
    updatedBy: "David Miller",
    updatedDate: "2025-05-08",
  },
  {
    gPrice: "350.00",
    bPrice: "315.00",
    aPrice: "310.00",
    sPrice: "305.00",
    updatedBy: "Emily Clark",
    updatedDate: "2025-05-07",
  },
  {
    gPrice: "400.00",
    bPrice: "360.00",
    aPrice: "355.00",
    sPrice: "350.00",
    updatedBy: "Robert King",
    updatedDate: "2025-05-06",
  },
  {
    gPrice: "450.00",
    bPrice: "405.00",
    aPrice: "400.00",
    sPrice: "395.00",
    updatedBy: "Alice Johnson",
    updatedDate: "2025-05-05",
  },
  {
    gPrice: "500.00",
    bPrice: "450.00",
    aPrice: "445.00",
    sPrice: "440.00",
    updatedBy: "Charlie Brown",
    updatedDate: "2025-05-04",
  },
  {
    gPrice: "550.00",
    bPrice: "495.00",
    aPrice: "490.00",
    sPrice: "485.00",
    updatedBy: "Olivia White",
    updatedDate: "2025-05-03",
  },
];


  // Define table columns
  const columns = [
    { name: "Gross Price", selector: (row) => row.gPrice, sortable: true },
    { name: "Net-B Price", selector: (row) => row.bPrice, sortable: true },
    { name: "Net-A Price", selector: (row) => row.aPrice, sortable: true },
    { name: "Special Price", selector: (row) => row.sPrice, sortable: true },
    { name: "Updated By", selector: (row) => row.updatedBy, sortable: true },
    { name: "Updated Date", selector: (row) => row.updatedDate, sortable: true },
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

export default PriceHistoryTab
