import DataTable from "react-data-table-component";
import { IoIosSearch } from "react-icons/io";

function CostHistoryTab() {
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
      poNum: "PO12345",
      itemName: "Main Warehouse",
      brand: "ABC Suppliers",
      origin: "10",
      unitCost: "50.00",
      netCost: "500.00",
      currency: "USD",
      convertedFactor: "1.0",
      convertedUnitPrice: "50.00",
      dateReplenished: "2025-05-07",
      replenishedBy: "John Doe",
      status: "Completed",
    },
    {
      poNum: "PO12346",
      itemName: "Branch A Warehouse",
      brand: "XYZ Traders",
      origin: "20",
      unitCost: "30.00",
      netCost: "600.00",
      currency: "USD",
      convertedFactor: "1.0",
      convertedUnitPrice: "30.00",
      dateReplenished: "2025-05-06",
      replenishedBy: "Jane Smith",
      status: "Pending",
    },
    {
      poNum: "PO12347",
      itemName: "Main Warehouse",
      brand: "Global Supplies",
      origin: "15",
      unitCost: "40.00",
      netCost: "600.00",
      currency: "USD",
      convertedFactor: "1.0",
      convertedUnitPrice: "40.00",
      dateReplenished: "2025-05-05",
      replenishedBy: "Michael Lee",
      status: "Completed",
    },
    {
      poNum: "PO12348",
      itemName: "Branch B Warehouse",
      brand: "Local Distributors",
      origin: "25",
      unitCost: "20.00",
      netCost: "500.00",
      currency: "USD",
      convertedFactor: "1.0",
      convertedUnitPrice: "20.00",
      dateReplenished: "2025-05-04",
      replenishedBy: "Sarah Connor",
      status: "Processing",
    },
    {
      poNum: "PO12349",
      itemName: "Main Warehouse",
      brand: "Prime Traders",
      origin: "30",
      unitCost: "15.00",
      netCost: "450.00",
      currency: "USD",
      convertedFactor: "1.0",
      convertedUnitPrice: "15.00",
      dateReplenished: "2025-05-03",
      replenishedBy: "David Miller",
      status: "Completed",
    },
  ];

  // Define table columns
  const columns = [
    { name: "P.O #", selector: (row) => row.poNum, sortable: true },
    { name: "Warehouse Name", selector: (row) => row.itemName, sortable: true },
    { name: "Supplier Name", selector: (row) => row.brand, sortable: true },
    { name: "Quantity", selector: (row) => row.origin, sortable: true },
    { name: "Unit Cost", selector: (row) => row.unitCost, sortable: true },
    { name: "Net Cost", selector: (row) => row.netCost, sortable: true },
    { name: "Currency", selector: (row) => row.currency, sortable: true },
    { name: "Converted Factor", selector: (row) => row.convertedFactor, sortable: true },
    { name: "Converted Unit Price", selector: (row) => row.convertedUnitPrice,sortable: true},
    { name: "Date Replenished", selector: (row) => row.dateReplenished, sortable: true },
    { name: "Replenished By", selector: (row) => row.replenishedBy, sortable: true },
    { name: "Status", selector: (row) => row.status, sortable: true },
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

export default CostHistoryTab;
