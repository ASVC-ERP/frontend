import DataTable from "react-data-table-component";

function SalesOrderHistoryTab() {
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
      date: "2025-05-12",
      salesOrderNum: "SO-1001",
      customerName: "Acme Corp",
      unitPrice: "100.00",
      quantity: 10,
      packedQty: 8,
      unservedQty: 2,
      dc1: "5%",
      dc2: "2%",
      agent: "John Doe",
      createdBy: "Admin",
    },
    {
      date: "2025-05-11",
      salesOrderNum: "SO-1002",
      customerName: "Globex Inc",
      unitPrice: "150.00",
      quantity: 20,
      packedQty: 18,
      unservedQty: 2,
      dc1: "10%",
      dc2: "0%",
      agent: "Jane Smith",
      createdBy: "Admin",
    },
    {
      date: "2025-05-10",
      salesOrderNum: "SO-1003",
      customerName: "Initech",
      unitPrice: "200.00",
      quantity: 15,
      packedQty: 15,
      unservedQty: 0,
      dc1: "0%",
      dc2: "5%",
      agent: "Michael Lee",
      createdBy: "Sales",
    },
    {
      date: "2025-05-09",
      salesOrderNum: "SO-1004",
      customerName: "Umbrella Corp",
      unitPrice: "250.00",
      quantity: 12,
      packedQty: 10,
      unservedQty: 2,
      dc1: "8%",
      dc2: "3%",
      agent: "Sarah Connor",
      createdBy: "Sales",
    },
    {
      date: "2025-05-08",
      salesOrderNum: "SO-1005",
      customerName: "Wayne Enterprises",
      unitPrice: "300.00",
      quantity: 25,
      packedQty: 25,
      unservedQty: 0,
      dc1: "5%",
      dc2: "5%",
      agent: "David Miller",
      createdBy: "Admin",
    },
    {
      date: "2025-05-07",
      salesOrderNum: "SO-1006",
      customerName: "Stark Industries",
      unitPrice: "350.00",
      quantity: 30,
      packedQty: 28,
      unservedQty: 2,
      dc1: "15%",
      dc2: "0%",
      agent: "Emily Clark",
      createdBy: "Sales",
    },
    {
      date: "2025-05-06",
      salesOrderNum: "SO-1007",
      customerName: "Oscorp",
      unitPrice: "400.00",
      quantity: 18,
      packedQty: 15,
      unservedQty: 3,
      dc1: "5%",
      dc2: "2%",
      agent: "Robert King",
      createdBy: "Sales",
    },
    {
      date: "2025-05-05",
      salesOrderNum: "SO-1008",
      customerName: "Daily Planet",
      unitPrice: "450.00",
      quantity: 20,
      packedQty: 20,
      unservedQty: 0,
      dc1: "0%",
      dc2: "0%",
      agent: "Alice Johnson",
      createdBy: "Admin",
    },
    {
      date: "2025-05-04",
      salesOrderNum: "SO-1009",
      customerName: "Pied Piper",
      unitPrice: "500.00",
      quantity: 22,
      packedQty: 20,
      unservedQty: 2,
      dc1: "10%",
      dc2: "0%",
      agent: "Charlie Brown",
      createdBy: "Sales",
    },
    {
      date: "2025-05-03",
      salesOrderNum: "SO-1010",
      customerName: "Cyberdyne Systems",
      unitPrice: "600.00",
      quantity: 15,
      packedQty: 14,
      unservedQty: 1,
      dc1: "5%",
      dc2: "5%",
      agent: "Olivia White",
      createdBy: "Admin",
    },
  ];

  // Define table columns
  const columns = [
    { name: "Date", selector: (row) => row.date, sortable: true },
    {
      name: "Sales Order No.",
      selector: (row) => row.salesOrderNum,
      sortable: true,
      width: "150px", // Ensure enough width
      cell: (row) => (
        <div style={{ whiteSpace: "nowrap" }}>{row.salesOrderNum}</div>
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
    { name: "Unit Price", selector: (row) => row.unitPrice, sortable: true },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true },
    { name: "Packed Qty", selector: (row) => row.packedQty, sortable: true, },
    {
      name: "Unserved Qty",
      selector: (row) => row.unservedQty,
      sortable: true,
      width: "150px", // Ensure enough width
      cell: (row) => (
        <div style={{ whiteSpace: "nowrap" }}>{row.unservedQty}</div>
      ),
    },
    { name: "Discount 1", selector: (row) => row.dc1, sortable: true },
    { name: "Discount 2", selector: (row) => row.dc2, sortable: true },
    { name: "Agent", selector: (row) => row.agent, sortable: true },
    {
      name: "Created By",
      selector: (row) => row.createdBy,
      sortable: true,
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
