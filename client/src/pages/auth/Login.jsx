import { useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  loginUser,
} from "../../services/authService";

import {
  useAuth,
} from "../../context/AuthContext";

import "../../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    // ===============================
    // FRONTEND VALIDATION
    // ===============================

    const cleanIdentifier =
      identifier.trim();

    if (!cleanIdentifier) {
      setError(
        "Please enter your email or username."
      );
      return;
    }

    if (!password.trim()) {
      setError(
        "Please enter your password."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(
        cleanIdentifier,
        password
      );

      login(
        data.user,
        data.token
      );

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-brand">

        <div className="auth-brand-content">

          <div className="auth-brand-logo">
            ConnectHub
          </div>

          <h1>
            Connect with people.
            <br />
            Share your world.
          </h1>

          <p>
            ConnectHub is your place to
            connect, share posts, chat
            with friends and build
            meaningful connections.
          </p>

          <div className="auth-brand-features">

            <div>
              <span>👥</span>
              <p>
                Connect with friends
              </p>
            </div>

            <div>
              <span>💬</span>
              <p>
                Chat in real time
              </p>
            </div>

            <div>
              <span>📸</span>
              <p>
                Share your moments
              </p>
            </div>

          </div>

        </div>

      </div>

      <div className="auth-form-section">

        <div className="auth-card">

          <div className="auth-mobile-logo">
            ConnectHub
          </div>

          <div className="auth-heading">

            <h2>
              Welcome Back 👋
            </h2>

            <p>
              Login using your email
              or username
            </p>

          </div>

          <form
            className="auth-form"
            onSubmit={submitHandler}
          >

            {/* EMAIL / USERNAME */}

            <div className="auth-field">

              <label htmlFor="login-identifier">
                Email or Username
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  👤
                </span>

                <input
                  id="login-identifier"
                  className="auth-input"
                  type="text"
                  placeholder="Enter email or username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(
                      e.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  required
                  autoComplete="username"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="auth-field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  🔒
                </span>

                <input
                  id="login-password"
                  className="auth-input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(
                      e.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  required
                  autoComplete="current-password"
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
              <div
                className="auth-error"
                role="alert"
              >
                ⚠️ {error}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              className="auth-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

          </form>

          <div className="auth-footer">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;