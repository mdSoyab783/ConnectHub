import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";
const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const changeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = await registerUser(formData);

      login(data.user, data.token);

      navigate("/");
    } catch (error) {
      alert(
        error.response?.data?.message || "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "60px auto",
        padding: "30px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,.1)",
      }}
    >
      <h2>Create Account</h2>

      <form onSubmit={submitHandler}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={changeHandler}
          required
        />

        <br />
        <br />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={changeHandler}
          required
        />

        <br />
        <br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={changeHandler}
          required
        />

        <br />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={changeHandler}
          required
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      <br />

      <p>
        Already have an account?{" "}
        <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;