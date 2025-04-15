function InfoForm({ info, setInfo }) {
    const handleChange = (e) => {
        const { id, value } = e.target;
        setInfo((prev) => ({
            ...prev,
            [id]: value
        }));
    };
    
    return (
        <div>
            <div className="row mx-5 d-flex align-items-center">
                <div className="col-1">
                    <label htmlFor="name" className=" h6">Name: </label>
                </div>
                <div className="col-6">
                    <input type="text" className="form-control form-control-sm" id="customerName" value={info.customerName}
                        onChange={handleChange} />
                </div>  
                <div className="col-2">
                    <label htmlFor="number" className="ms-5 h6">Contact No: </label>
                </div>
                <div className="col-3">
                    <input type="text" className="form-control form-control-sm" id="customerNumber" value={info.customerNumber}
                        onChange={handleChange}/>
                </div>
            </div>

            <div className="row mx-5 mt-3 d-flex align-items-center">
                <div className="col-1">
                    <label htmlFor="address" className=" h6">Address: </label>
                </div>
                <div className="col-6">
                    <input type="text" className="form-control form-control-sm" id="customerAddress" value={info.customerAddress}
                        onChange={handleChange}/>
                </div>  
                <div className="col-2">
                    <label htmlFor="delivery" className="ms-5 h6">Delivery Type: </label>
                </div>
                <div className="col-3">
                    <select className="form-select" aria-label="Default select example" id="delivery" value={info.delivery}
                        onChange={handleChange}>
                        <option value="1">Shipping</option>
                        <option value="2">Pick-up</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default InfoForm;
