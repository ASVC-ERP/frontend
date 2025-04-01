import Sidebar from "./Components/Sidebar.jsx"
import Header from "./Components/Header.jsx"
import SalesOrderTable from "./Components/SalesOrderTable.jsx"
import "./App.css"

function App() {


  return (
      <div className="container-fluid vh-100">
        <div className="row h-100">
          <div className="col-2 overflow-hidden d-flex flex-column" style={{ backgroundColor: "#e2e3e5" }}>
            <Sidebar />
          </div>

          <div className="col-10 d-flex flex-column p-0">
            
            <div className="p-3" style={{ backgroundColor: "#e2e3e5" }}>
              <Header />
            </div>

            <div className="flex-grow-1 overflow-auto p-3 rounded-5">
              <SalesOrderTable  />
            </div>

          </div>
        </div>
      </div>

  )
}

export default App
