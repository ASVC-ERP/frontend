import Sidebar from "./Components/Sidebar.jsx"
import Header from "./Components/Header.jsx"

function App() {


  return (
      <div className="container-fluid vh-100">
        <div className="row h-100">
          <div className="col-2 bg-light overflow-hidden d-flex flex-column">
            <Sidebar />
          </div>

          <div className="col-10 d-flex flex-column p-0">
            
            <div className="bg-light p-3">
              <Header />
            </div>

            <div className="flex-grow-1 overflow-auto p-3">
              BODY CONTENT HERE
            </div>

          </div>
        </div>
      </div>

  )
}

export default App
