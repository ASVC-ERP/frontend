import { IoConstructOutline } from "react-icons/io5";
import "../styles/underconstruction.css"

function UnderConstruction() {
  return (
    <div className="under-construction-page">
      <div className="construction-card">
        <div className="construction-icon">
          <IoConstructOutline />
        </div>

        <h1 className="construction-title">
          Module Under Development
        </h1>

        <p className="construction-text">
          This feature is currently being built and will be available in a
          future update.
        </p>

        <div className="construction-progress">
          <div className="construction-progress-bar" />
        </div>

        <span className="construction-status">
          Development in Progress...
        </span>
      </div>
    </div>
  );
}

export default UnderConstruction;