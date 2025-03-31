import { BsPersonCircle  } from "react-icons/bs";

export default function Sidebar(){
    return (
        <div className="d-flex justify-content-between align-items-center">
            <div>
                <input 
                type="search" 
                className="form-control rounded-5" 
                placeholder="Search..." 
                style={{ width: "700px" }} 
                />
            </div>

            <div className="d-flex align-items-center me-5">
                <p className="h5 me-3" style={{ color: "#0C1D61" }}>Hi, Jerry 兄!</p>
                <BsPersonCircle size={30} color="#0C1D61" />
            </div>
        </div>

    );
}