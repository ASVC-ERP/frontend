import DataTable from "react-data-table-component";
import { useState } from "react";
import { IoIosSearch } from "react-icons/io";

function InvoiceTable() {
  const customerData = [
  { custId: "CUST-001", customerName: "John Doe", contact: "0917-123-4567", address: "123 Elm Street, Quezon City" },
  { custId: "CUST-002", customerName: "Jane Smith", contact: "0928-987-6543", address: "456 Pine Avenue, Makati" },
  { custId: "CUST-003", customerName: "Carlos Mendoza", contact: "0935-555-1234", address: "789 Oak Road, Taguig" },
  { custId: "CUST-004", customerName: "Maricar Santos", contact: "0918-321-7890", address: "321 Birch Street, Pasig" },
  { custId: "CUST-005", customerName: "Luis Reyes", contact: "0947-111-2233", address: "654 Maple Drive, Manila" },
  { custId: "CUST-006", customerName: "Ana Dela Cruz", contact: "0956-456-7890", address: "88 Acacia Lane, Marikina" },
  { custId: "CUST-007", customerName: "Miguel Rivera", contact: "0967-000-3456", address: "12 Kalayaan Ave, BGC, Taguig" },
  { custId: "CUST-008", customerName: "Sophia Tan", contact: "0933-234-5678", address: "90 Jasmine St, Mandaluyong" },
  { custId: "CUST-009", customerName: "Daniel Cruz", contact: "0922-456-7891", address: "45 Camia Rd, San Juan City" },
  { custId: "CUST-010", customerName: "Patricia Lim", contact: "0916-222-3334", address: "18 Lilac Street, Antipolo" },
  { custId: "CUST-011", customerName: "Joshua Garcia", contact: "0945-345-6678", address: "72 Mango Ave, Las Piñas" },
  { custId: "CUST-012", customerName: "Andrea Lopez", contact: "0919-123-4321", address: "500 Nicanor Reyes St, Sampaloc" },
  { custId: "CUST-013", customerName: "Ramon Velasco", contact: "0927-765-4321", address: "101 Bonifacio St, Caloocan" },
  { custId: "CUST-014", customerName: "Katrina Go", contact: "0951-234-8765", address: "33 Sunflower Road, Parañaque" },
  { custId: "CUST-015", customerName: "Emilio Aquino", contact: "0938-888-9990", address: "200 Rizal Blvd, Muntinlupa" },
];


  const columns = [
    {
      name: "Customer ID",
      selector: (row) => row.custId,
      sortable: true,
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Contact Number",
      selector: (row) => row.contact,
      sortable: true,
      center: true,
    },
    {
      name: "Address",
      selector: (row) => row.address,
      sortable: true,
      center: true,
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(customerData);

  // Handle search input change
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = Object.values(customerData).filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        {/* Search input field */}
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
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="500px"
        className="custom-data-table"
      />
    </div>
  );
}

export default InvoiceTable;
