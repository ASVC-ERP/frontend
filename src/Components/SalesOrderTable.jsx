function SalesOrderTable() {
    return (
        <div className="container mt-3">

            <div className="d-flex justify-content-between align-items-center">
                <p className="h1 fw-bold mb-0 ms-3" style={{ color: "#0C1D61" }}>Sales Order</p>
                <button type="button" className="btn me-5" style={{ backgroundColor: "#0C1D61", color: "white" }}>+ Add Order</button>
            </div>


            <div className="row table-responsive mx-3">
                <table className="table table-secondary table-hover align-middle text-center table-lg mt-3 mx-auto">
                    <thead className="">
                        <th className="h5 ps-3 pt-3 fw-bold text-md-start rounded-top-4" colspan="6" style={{ backgroundColor: "#e2e3e5" }}>ORDER SUMMARY</th>
                        <tr className="text-center">
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer Name</th>
                            <th>Customer Address</th>
                            <th>Sales Agent</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    
                    <tbody className="table-group-divider">
                        <tr>
                            <td>000001</td>
                            <td>03-15-2025</td>
                            <td>Jiko Aldrei Sy</td>
                            <td>Amaia Doroteo Jose</td>
                            <td>Jerry Ting</td>
                            <td>Completed</td>
                        </tr>
                        <tr>
                            <td>000002</td>
                            <td>03-15-2025</td>
                            <td>Jiko Aldrei Sy</td>
                            <td>Amaia Doroteo Jose</td>
                            <td>Jerry Ting</td>
                            <td>Reserved</td>
                        </tr>
                        <tr>
                            <td>000003</td>
                            <td>03-15-2025</td>
                            <td>Jiko Aldrei Sy</td>
                            <td>Amaia Doroteo Jose</td>
                            <td>Jerry Ting</td>
                            <td>Reserved</td>
                        </tr>
                        <tr>
                            <td>000004</td>
                            <td>03-15-2025</td>
                            <td>Jiko Aldrei Sy</td>
                            <td>Amaia Doroteo Jose</td>
                            <td>Jerry Ting</td>
                            <td>Completed</td>
                        </tr>
                        <tr>
                            <td>000005</td>
                            <td>03-15-2025</td>
                            <td>Jiko Aldrei Sy</td>
                            <td>Amaia Doroteo Jose</td>
                            <td>Jerry Ting</td>
                            <td>Reserved</td>
                        </tr>
                        <tr>
                            <td>000006</td>
                            <td>03-15-2025</td>
                            <td>Jiko Aldrei Sy</td>
                            <td>Amaia Doroteo Jose</td>
                            <td>Jerry Ting</td>
                            <td>Completed</td>
                        </tr>
                        <tr>
                            <td>000007</td>
                            <td>03-15-2025</td>
                            <td>Jiko Aldrei Sy</td>
                            <td>Amaia Doroteo Jose</td>
                            <td>Jerry Ting</td>
                            <td>Reserved</td>
                        </tr>
                        <tr>
                            <td>000008</td>
                            <td>03-15-2025</td>
                            <td>Jiko Aldrei Sy</td>
                            <td>Amaia Doroteo Jose</td>
                            <td>Jerry Ting</td>
                            <td>Reserved</td>
                        </tr>
                        <tr>
                            <td>000009</td>
                            <td>03-15-2025</td>
                            <td>Jiko Aldrei Sy</td>
                            <td>Amaia Doroteo Jose</td>
                            <td>Jerry Ting</td>
                            <td>Reserved</td>
                        </tr>
                        <tr>
                            <td>000010</td>
                            <td>03-15-2025</td>
                            <td>Jiko Aldrei Sy</td>
                            <td>Amaia Doroteo Jose</td>
                            <td>Jerry Ting</td>
                            <td>Reserved</td>
                        </tr>
                        <tr>
                            <td>000011</td>
                            <td>03-15-2025</td>
                            <td>Fildric Cadby Chu</td>
                            <td>Tayuman St Tondo Manila</td>
                            <td>Jerry Ting</td>
                            <td>Reserved</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SalesOrderTable
