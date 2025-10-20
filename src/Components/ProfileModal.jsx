const ProfileModal = ({ user }) => {
  return (
    <div
      className="modal fade"
      id="profileModal"
      tabIndex="-1"
      aria-labelledby="profileModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg w-50">
        <div className="modal-content shadow-lg border-0">
          {/* Header with gradient background */}
          <div
            className="modal-header text-white position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1E5A84 0%, #1e3c72 100%)",
              borderRadius: "0.5rem 0.5rem 0 0",
            }}
          >
            <div className="d-flex align-items-center">
              <div>
                <h5 className="modal-title mb-0" id="profileModalLabel">
                  User Profile
                </h5>
                <small className="opacity-75">View user information</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white p-4"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>

            {/* Decorative elements */}
            <div
              className="position-absolute"
              style={{
                top: "-50px",
                right: "-50px",
                width: "100px",
                height: "100px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
              }}
            ></div>
            <div
              className="position-absolute"
              style={{
                bottom: "-30px",
                left: "-30px",
                width: "60px",
                height: "60px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "50%",
              }}
            ></div>
          </div>

          <div className="modal-body p-4">
            <div className="row g-3">
              {/* User ID */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted small">
                  <i
                    className="fas fa-id-badge me-2"
                    style={{ color: "#1E5A84" }}
                  ></i>
                  User ID
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.id || ""}
                  readOnly
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "0.5rem",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Username */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted small">
                  <i
                    className="fas fa-at me-2"
                    style={{ color: "#1E5A84" }}
                  ></i>
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.username || ""}
                  readOnly
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "0.5rem",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* First Name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted small">
                  <i
                    className="fas fa-user me-2"
                    style={{ color: "#1E5A84" }}
                  ></i>
                  First Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.firstName || ""}
                  readOnly
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "0.5rem",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Last Name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted small">
                  <i
                    className="fas fa-user me-2"
                    style={{ color: "#1E5A84" }}
                  ></i>
                  Last Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.lastName || ""}
                  readOnly
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "0.5rem",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Position */}
              <div className="col-12">
                <label className="form-label fw-semibold text-muted small">
                  <i
                    className="fas fa-briefcase me-2"
                    style={{ color: "#1E5A84" }}
                  ></i>
                  Position
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    user?.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : "Agent"
                  }
                  readOnly
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "0.5rem",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
            </div>

            {/* Additional info card */}
            <div
              className="mt-4 p-3 rounded-3"
              style={{
                backgroundColor: "rgba(12, 29, 97, 0.05)",
                border: "1px solid rgba(12, 29, 97, 0.1)",
              }}
            >
              <div className="d-flex align-items-center">
                <i
                  className="fas fa-info-circle me-2"
                  style={{ color: "#1E5A84" }}
                ></i>
                <small className="text-muted">
                  Profile information is read-only. Contact your administrator
                  for any changes.
                </small>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light border-0 rounded-bottom">
            <button
              type="button"
              className="btn px-4 py-2"
              data-bs-dismiss="modal"
              style={{
                backgroundColor: "#1E5A84",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#1e3c72";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#1E5A84";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <i className="fas fa-times me-2"></i>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
