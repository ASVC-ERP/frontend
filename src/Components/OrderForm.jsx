import { IoIosSearch } from "react-icons/io";
import defaultPic from "../assets/defaultPic.jpg"

function OrderForm() {
    return (
        <div>
            <div className="row justify-content-between">
                <div className="position-relative w-75 ms-2">
                    <IoIosSearch className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search inventory"
                        value=""
                        onChange=""
                        className="form-control form-control-sm ps-5 border-2 rounded-3"
                    />
                </div>
            </div>

            <div className="row justify-content-between mx-2 mt-3">
                <table className="table transparent-table custom-border-table text-center fw-semibold" >
                    <thead className="custom-header-color">
                        <tr>
                            <th className="text-start col-4">Product</th>
                            <th className="col-3">Price</th>
                            <th className="col-1"></th>
                            <th className="col-1">Quantity</th>
                            <th className="">Total</th>
                            <th className="col-1"></th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">
                        <tr>
                            <td className="text-start col-4">
                                <div className="d-flex align-items-center gap-3">
                                    <img src={defaultPic} alt="Product" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />
                                    <div className="d-flex flex-column">
                                    <span className="fw-semibold">Product Name</span>
                                    <span style={{ fontSize: "0.85rem", fontWeight:"bold", color: "#ACACAC" }}>In stock: 58 pcs</span>
                                    </div>
                                </div>
                            </td>
                            <td className="col-3">
                                <select className="form-select mx-auto d-block w-50" aria-label="Default select example" id="markup">
                                    <option value="1">Markup 1</option>
                                    <option value="2">Markup 2</option>
                                    <option value="3">Markup 3</option>
                                </select>
                            </td>
                            <td className="text-start col-1" style={{color:"#ACACAC"}}> X </td>
                            <td className="col-1">
                                <input type="text" className="form-control mx-auto d-block w-75 text-center" />
                            </td>
                            <td class=" font-monospace">
                                <span style={{display: "inline-block", width: "1.5em"}}>₱</span>
                                <span>920.00</span>
                            </td>
                            <td className="col-1"><button type="button" className="btn btn-secondary btn-sm">Reserve</button></td>
                        </tr>
                        <tr>
                            <td className="text-start col-4">
                                <div className="d-flex align-items-center gap-3">
                                    <img src={defaultPic} alt="Product" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />
                                    <div className="d-flex flex-column">
                                    <span className="fw-semibold">Product Name</span>
                                    <span style={{ fontSize: "0.85rem", fontWeight:"bold", color: "#B64345" }}>In stock: 0 pcs</span>
                                    </div>
                                </div>
                            </td>
                            <td className="col-3">
                                <select className="form-select mx-auto d-block w-50" aria-label="Default select example" id="markup">
                                    <option value="1">Markup 1</option>
                                    <option value="2">Markup 2</option>
                                    <option value="3">Markup 3</option>
                                </select>
                            </td>
                            <td className="text-start col-1" style={{color:"#ACACAC"}}> X </td>
                            <td className="col-1"><input type="text" className="form-control mx-auto d-block w-75 text-center" /></td>
                            <td class=" font-monospace">
                                <span style={{display: "inline-block", width: "1.5em"}}>₱</span>
                                <span>10,500.00</span>
                            </td>
                            <td className="col-1"><button type="button" className="btn btn-secondary btn-sm">Reserve</button></td>
                        </tr>
                        <tr>
                            <td className="text-start col-4">
                                <div className="d-flex align-items-center gap-3">
                                    <img src={defaultPic} alt="Product" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />
                                    <div className="d-flex flex-column">
                                    <span className="fw-semibold">Product Name</span>
                                    <span style={{ fontSize: "0.85rem", fontWeight:"bold", color: "#F8B13D" }}>In stock: 0 pcs</span>
                                    </div>
                                </div>
                            </td>
                            <td className="col-3">
                                <select className="form-select mx-auto d-block w-50" aria-label="Default select example" id="markup">
                                    <option value="1">Markup 1</option>
                                    <option value="2">Markup 2</option>
                                    <option value="3">Markup 3</option>
                                </select>
                            </td>
                            <td className="text-start col-1" style={{color:"#ACACAC"}}> X </td>
                            <td className="col-1"><input type="text" className="form-control mx-auto d-block w-75 text-center" /></td>
                            <td class=" font-monospace">
                                <span style={{display: "inline-block"}}>₱</span>
                                <span>5,000.00</span>
                            </td>
                            <td className="col-1"><button type="button" className="btn btn-secondary btn-sm">Reserve</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default OrderForm
