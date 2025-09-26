import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      const user = response.data.user;

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(user));

      console.log("Login successful:", user);

      onLoginSuccess();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="d-flex vh-100 justify-content-center align-items-center"
      style={{ backgroundColor: "#0C1D61" }}
    >
      <form
        onSubmit={handleLogin}
        className="p-5 pt-2 bg-light rounded shadow w-25"
      >
        <img
          src={logo}
          alt="companyLogo"
          className="d-flex mx-auto mt-0 pt-0"
          style={{ width: "100px" }}
        />

        <div className="mb-3">
          <label
            className="form-label fw-semibold"
            style={{ color: "#0C1D61" }}
          >
            Username
          </label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label
            className="form-label fw-semibold"
            style={{ color: "#0C1D61" }}
          >
            Password
          </label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}

        <button
          type="submit"
          className="btn w-100 text-white"
          style={{ backgroundColor: "#0C1D61" }}
        >
          LOGIN
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
