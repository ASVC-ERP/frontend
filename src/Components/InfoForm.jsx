function InfoForm() {
    return (
        <div>
            <div className="row mx-5 d-flex align-items-center">
                <div className="col-1">
                    <label for="name" className=" h6">Name: </label>
                </div>
                <div className="col-6">
                    <input type="text" className="form-control form-control-sm" id="name" />
                </div>  
                <div className="col-2">
                    <label for="number" className="ms-5 h6">Contact No: </label>
                </div>
                <div className="col-3">
                    <input type="text" className="form-control form-control-sm" id="number" />
                </div>
            </div>

            <div className="row mx-5 mt-3 d-flex align-items-center">
                <div className="col-1">
                    <label for="address" className=" h6">Address: </label>
                </div>
                <div className="col-6">
                    <input type="text" className="form-control form-control-sm" id="address" />
                </div>  
                <div className="col-2">
                    <label for="delivery" className="ms-5 h6">Delivery Type: </label>
                </div>
                <div className="col-3">
                    <select className="form-select" aria-label="Default select example" id="delivery">
                        <option value="2">Shipping</option>
                        <option value="3">Pick-up</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default InfoForm;
