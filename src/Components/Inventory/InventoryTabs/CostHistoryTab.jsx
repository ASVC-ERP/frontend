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
    {
      id: 1,
      name: "Invoice #",
      selector: (row) => row.invoiceNum,
      sortable: true,
      width: "100px",
    },
    {
      id: 2,
      name: "Supplier",
      selector: (row) => row.supplierName,
      sortable: true,
    },
    {
      id: 3,
      name: "P.O #",
      selector: (row) => row.poNum,
      sortable: true,
      width: "100px",
    },
    { id: 4, name: "Name", selector: (row) => row.name, sortable: true },
    {
      id: 5,
      name: "Quantity",
      selector: (row) => row.quantity,
      sortable: true,
      width: "100px",
    },
    {
      id: 6,
      name: "Price 1",
      selector: (row) => row.unitCost,
      sortable: false,
      width: "75px",
    },
    {
      id: 7,
      name: "Price 2",
      selector: (row) => row.unitCost,
      sortable: false,
      width: "75px",
    },
    {
      id: 8,
      name: "Price 3",
      selector: (row) => row.unitCost,
      sortable: false,
      width: "75px",
    },
    {
      id: 9,
      name: "Price 4",
      selector: (row) => row.unitCost,
      sortable: false,
      width: "75px",
    },
    {
      id: 10,
      name: "Currency",
      selector: (row) => row.currency,
      sortable: true,
      width: "100px",
    },
    {
      id: 11,
      name: "Conversion Factor",
      selector: (row) => row.convertedFactor,
      sortable: true,
      cell: (row) => {
        row.convertedFactor;
      },
    },
    {
      id: 12,
      name: " Date",
      selector: (row) => row.updatedDate,
      sortable: true,
      width: "100px",
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
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
