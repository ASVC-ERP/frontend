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
      supplierName: "ABC Suppliers",
      invoiceNum: "INV001",
      name: "Product A",
      quantity: "10",
      unitCost: "50.00",
      currency: "USD",
      convertedFactor: "1.0",
    },
    {
      poNum: "PO12346",
      itemName: "Branch A Warehouse",
      supplierName: "XYZ Traders",
      invoiceNum: "INV002",
      name: "Product B",
      quantity: "20",
      unitCost: "30.00",
      currency: "USD",
      convertedFactor: "1.0",
    },
    {
      poNum: "PO12347",
      itemName: "Main Warehouse",
      supplierName: "Global Supplies",
      invoiceNum: "INV003",
      name: "Product C",
      quantity: "15",
      unitCost: "40.00",
      currency: "USD",
      convertedFactor: "1.0",
    },
    {
      poNum: "PO12348",
      itemName: "Branch B Warehouse",
      supplierName: "Local Distributors",
      invoiceNum: "INV004",
      name: "Product D",
      quantity: "25",
      unitCost: "20.00",
      currency: "USD",
      convertedFactor: "1.0",
    },
    {
      poNum: "PO12349",
      itemName: "Main Warehouse",
      supplierName: "Prime Traders",
      invoiceNum: "INV005",
      name: "Product E",
      quantity: "30",
      unitCost: "15.00",
      currency: "USD",
      convertedFactor: "1.0",
    },
  ];

  // Define table columns
  const columns = [
    { name: "P.O #", selector: (row) => row.poNum, sortable: true },
    {
      name: "Warehouse Name",
      selector: (row) => row.itemName,
      sortable: true,
      width: "150px", // Ensure enough width
      cell: (row) => (
        <div style={{ whiteSpace: "nowrap" }}>{row.itemName}</div>
      ),
    },
    {
      name: "Supplier Name",
      selector: (row) => row.supplierName,
      sortable: true,
    },
    { name: "Invoice #", selector: (row) => row.invoiceNum, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true },
    { name: "Price", selector: (row) => row.unitCost, sortable: true },
    { name: "Currency", selector: (row) => row.currency, sortable: true },
    {
      name: "Conversion Factor",
      selector: (row) => row.convertedFactor,
      sortable: true,
      width: "170px", // Ensure enough width
      cell: (row) => (
        <div style={{ whiteSpace: "nowrap" }}>{row.convertedFactor}</div>
      ),
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

export default CostHistoryTab;
