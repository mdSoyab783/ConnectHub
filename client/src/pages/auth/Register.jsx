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
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState("");

  const changeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await registerUser(formData);

      login(data.user, data.token);

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* =========================================
          LEFT BRAND SECTION
      ========================================= */}

      <div className="auth-brand">

        <div className="auth-brand-content">

          <div className="auth-brand-logo">
            ConnectHub
          </div>

          <h1>
            Join the community.
            <br />
            Start connecting.
          </h1>

          <p>
            Create your ConnectHub account and
            start sharing, chatting and connecting
            with people around you.
          </p>

          <div className="auth-brand-features">

            <div>
              <span>👥</span>
              <p>Meet new people</p>
            </div>

            <div>
              <span>💬</span>
              <p>Stay connected</p>
            </div>

            <div>
              <span>🚀</span>
              <p>Build your network</p>
            </div>

          </div>

        </div>

      </div>


      {/* =========================================
          REGISTER SECTION
      ========================================= */}

      <div className="auth-form-section">

        <div className="auth-card">

          <div className="auth-mobile-logo">
            ConnectHub
          </div>

          <div className="auth-heading">

            <h2>
              Create Account 🚀
            </h2>

            <p>
              Join ConnectHub and start connecting
            </p>

          </div>


          <form
            className="auth-form"
            onSubmit={submitHandler}
          >

            {/* FULL NAME */}

            <div className="auth-field">

              <label htmlFor="fullName">
                Full Name
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  👤
                </span>

                <input
                  id="fullName"
                  className="auth-input"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={changeHandler}
                  required
                  autoComplete="name"
                />

              </div>

            </div>


            {/* USERNAME */}

            <div className="auth-field">

              <label htmlFor="username">
                Username
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  @
                </span>

                <input
                  id="username"
                  className="auth-input"
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={changeHandler}
                  required
                  autoComplete="username"
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="auth-field">

              <label htmlFor="register-email">
                Email
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ✉️
                </span>

                <input
                  id="register-email"
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={changeHandler}
                  required
                  autoComplete="email"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="auth-field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  🔒
                </span>

                <input
                  id="register-password"
                  className="auth-input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={changeHandler}
                  required
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div className="auth-error">
                ⚠️ {error}
              </div>
            )}


            {/* REGISTER BUTTON */}

            <button
              className="auth-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

          </form>


          {/* FOOTER */}

          <div className="auth-footer">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;