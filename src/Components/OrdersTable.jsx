import { useState } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";  // Import Link from react-router-dom
import { IoIosSearch } from "react-icons/io";
import defaultPic from "../assets/defaultPic.jpg"




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
    const [showRowModal, setShowRowModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
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
      console.log('Row clicked:', row);
        setSelectedRow(row);
        setShowRowModal(true);
    };

    const handleRequestInvoice = () => {
        setShowRequestModal(true); // Show the Request Invoice modal
        setShowRowModal(false); // Close the current order details modal (optional)
    }


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

      {showRowModal && selectedRow && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header d-flex flex-column align-items-start">
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <p className="mb-2" style={{color: "#05050599", fontSize:"12px"}}>Sales &gt; Order &gt; {selectedRow.orderId}</p>
                  <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRowModal(false)}
                  ></button>
                </div>
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0" style={{color: "#0C1D61"}}>Order ID: {selectedRow.orderId}</h5>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ backgroundColor: "#0C1D61", color: "white" }}
                    onClick={handleRequestInvoice}
                    > Request Invoice</button>
                </div>
              </div>
              <div className="modal-body">
                <div className=" rounded-3" style={{ maxHeight: '250px', overflowY: 'auto'}} >
                  <ul className="list-unstyled">
                    {selectedRow.orderItems.map((item, index) => (
                      <li key={index}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          {/* Image and Product Info */}
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={defaultPic}
                              alt="Product"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">{item.name}</span>
                            </div>
                          </div>

                          {/* Price and Qty */}
                          <div className="text-end d-flex flex-column">
                            <span className="fw-semibold">
                              ₱{(item.price[item.selectedMarkup] * item.quantity).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  </div>

                  {/* Total Row */}
                  <div className="d-flex justify-content-between align-items-center pt-3 ms-3">
                    <span className="h5 fw-semibold ">Total</span>
                    <span className="fw-bold h5">
                      ₱{selectedRow.totalPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>              
                </div>

              {/* Modal Footer */}
              <div className="modal-footer d-flex justify-content-between align-items-end px-3 ">
                <div>
                  <p className="fw-bold mb-1" style={{ color: "#0C1D61" }}>{selectedRow.customerName}</p>
                  <p className="mb-0">{selectedRow.customerAddress}</p>
                  <p className="mb-0">{selectedRow.customerNumber}</p>
                </div>
                <p className="text-muted small mb-0">{new Date(selectedRow.date).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}</p>
              </div>
            </div>
          </div>
        </div>
        )}


        {/* REQUEST INVOICE MODAL */}
        {showRequestModal && selectedRow && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header d-flex flex-column align-items-start">
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <p className="mb-2" style={{color: "#05050599", fontSize:"12px"}}>Sales &gt; Order &gt; {selectedRow.orderId}</p>
                  <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRequestModal(false)}
                  ></button>
                </div>
                <div className="w-100 d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0" style={{color: "#0C1D61"}}>Order ID: {selectedRow.orderId}</h5>
                </div>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <p className="h5"> What type of document would you like to create? </p>

                <div className="d-flex justify-content-center gap-3 mt-4 mb-3">
                  <button className="btn" style={{ backgroundColor: "#0C1D61", color: "white" }}>Sales Invoice</button>
                  <button className="btn" style={{ backgroundColor: "#0C1D61", color: "white" }}>Delivery Receipt</button>
                  <button className="btn" style={{ backgroundColor: "#0C1D61", color: "white" }}>SI/DR</button>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer d-flex justify-content-between align-items-end px-3 ">
                <div>
                  <p className="fw-bold mb-1" style={{ color: "#0C1D61" }}>{selectedRow.customerName}</p>
                  <p className="mb-0">{selectedRow.customerAddress}</p>
                  <p className="mb-0">{selectedRow.customerNumber}</p>
                </div>
                <p className="text-muted small mb-0">{new Date(selectedRow.date).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}</p>
              </div>
            </div>
          </div>
        </div>
        )}




    </div>
    );
}

export default OrdersTable
