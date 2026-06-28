import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/authenticate/login`, {
        username,
        password,
      });

      const token = response.data.access_token;
      localStorage.setItem("access_token", token);

      const user = await axios.get(`${API_URL}/authenticate/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profile = user.data;

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(profile));

      onLoginSuccess();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-box">
          <img src={logo} alt="Company Logo" className="login-logo" />
        </div>

        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to continue to your account</p>

        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;