import { useState } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";  // Import Link from react-router-dom
import { IoIosSearch } from "react-icons/io";



// Define table columns
const columns = [
  { name: "Order ID", selector: (row) => row.orderId, sortable: true },
  { name: "Date", selector: (row) => row.date, sortable: true },
  { name: "Customer Name", selector: (row) => row.customerName, sortable: true },
  { name: "Customer Address", selector: (row) => row.customerAddress, sortable: true },
  { name: "Sales Agent", selector: (row) => row.salesAgent, sortable: true },
  { name: "Status", selector: (row) => row.status, sortable: true }
];

// Define table data
const data = [
  { orderId: "000001", date: "03-15-2025", customerName: "Jiko Aldrei Sy", customerAddress: "Amaia Doroteo Jose", salesAgent: "Prince Pimentel", status: "Completed" },
  { orderId: "000002", date: "03-15-2025", customerName: "Jiko Aldrei Sy", customerAddress: "Amaia Doroteo Jose", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000003", date: "03-15-2025", customerName: "Jiko Aldrei Sy", customerAddress: "Amaia Doroteo Jose", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000004", date: "03-15-2025", customerName: "Jiko Aldrei Sy", customerAddress: "Amaia Doroteo Jose", salesAgent: "Prince Pimentel", status: "Completed" },
  { orderId: "000005", date: "03-15-2025", customerName: "Jiko Aldrei Sy", customerAddress: "Amaia Doroteo Jose", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000006", date: "03-15-2025", customerName: "Jiko Aldrei Sy", customerAddress: "Amaia Doroteo Jose", salesAgent: "Prince Pimentel", status: "Completed" },
  { orderId: "000007", date: "03-15-2025", customerName: "Jiko Aldrei Sy", customerAddress: "Amaia Doroteo Jose", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000008", date: "03-15-2025", customerName: "Jiko Aldrei Sy", customerAddress: "Amaia Doroteo Jose", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000009", date: "03-15-2025", customerName: "Jiko Aldrei Sy", customerAddress: "Amaia Doroteo Jose", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000010", date: "03-15-2025", customerName: "Jiko Aldrei Sy", customerAddress: "Amaia Doroteo Jose", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" },
  { orderId: "000011", date: "03-15-2025", customerName: "Fildric Cadby Chu", customerAddress: "Tayuman St Tondo Manila", salesAgent: "Prince Pimentel", status: "Reserved" }
];

function OrdersTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState(data);

    // Handle search input change
    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = data.filter((row) =>
        Object.values(row).some(
            (field) =>
            field.toString().toLowerCase().includes(value)
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

                <Link to="/create-order">
                    <button
                        type="button"
                        className="btn me-5"
                        style={{ backgroundColor: "#0C1D61", color: "white" }}
                    >
                        + Add Order
                    </button>
                </Link>
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
    )
}

export default OrdersTable
