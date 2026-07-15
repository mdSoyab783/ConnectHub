import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(email, password);

      login(data.user, data.token);

      navigate("/");
    } catch (error) {
      alert(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
  <div className="auth-container">

    <div className="auth-card">

      <div className="auth-logo">
        ConnectHub
      </div>

      <h2 className="auth-title">
        Welcome Back
      </h2>

      <form onSubmit={submitHandler}>

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <button
          className="auth-btn"
          type="submit"
        >
          Login
        </button>

      </form>

      <div className="auth-footer">

        Don't have an account?{" "}

        <Link to="/register">
          Register
        </Link>

      </div>

    </div>

  </div>
);
};

export default Login;