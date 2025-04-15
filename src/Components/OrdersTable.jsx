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
function OrdersTable({orders}) {
    const [showModal, setShowModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState(Object.values(orders));

    // Handle search input change
    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = Object.values(orders).filter((row) =>
            Object.values(row).some((field) =>
              field?.toString().toLowerCase().includes(value)
            )
          );

        setFilteredData(filtered);
    };

    const handleRowClick = (row) => {
        setSelectedRow(row);
        setShowModal(true);
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
                onRowClicked={handleRowClick}
                className="custom-data-table"
            />

            {showModal && selectedRow && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Order Details - {selectedRow.orderId}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>Name:</strong> {selectedRow.customerName}</p>
                  <p><strong>Number:</strong> {selectedRow.customerNumber}</p>
                  <p><strong>Address:</strong> {selectedRow.customerAddress}</p>
                  <p><strong>Delivery Option:</strong> {selectedRow.delivery}</p>
                  <p><strong>Status:</strong> {selectedRow.status}</p>
                  <p><strong>Total:</strong> ₱{selectedRow.totalPrice.toLocaleString()}</p>
        
                  <h6 className="mt-4">Items:</h6>
                  <ul>
                    {selectedRow.orderItems.map((item, index) => (
                      <li key={index}>
                        {item.quantity}x {item.name} @ ₱{item.price[item.selectedMarkup]} each
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>
    )
}

export default OrdersTable
