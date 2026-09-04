import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import logo from "../../assets/logo.png";

function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Switch Login / Signup
  const switchForm = (login) => {
    setIsLogin(login);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSubmitting(false);
  };

  // Login input
  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Signup input
  const handleSignupChange = (e) => {
    const { name, value } = e.target;

    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Login
  const handleLogin = (e) => {
    e.preventDefault();

    const { email, password } = loginData;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setSuccess("Login successful! Redirecting...");
    setSubmitting(true);

    // Go to Role Selection
    setTimeout(() => {
      navigate("/role-selection");
    }, 1000);
  };

  // Signup
  const handleSignup = (e) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      confirmPassword,
    } = signupData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccess("Account created successfully! Redirecting...");
    setSubmitting(true);

    // Go to Role Selection
    setTimeout(() => {
      navigate("/role-selection");
    }, 1000);
  };

  const passwordsMatch =
    signupData.password &&
    signupData.confirmPassword &&
    signupData.password === signupData.confirmPassword;

  const passwordsMismatch =
    signupData.password &&
    signupData.confirmPassword &&
    signupData.password !== signupData.confirmPassword;

  return (
    <div className="auth-page">

      {/* Background decorations */}
      <div className="background-circle circle-one"></div>
      <div className="background-circle circle-two"></div>
      <div className="background-circle circle-three"></div>

      {/* Left branding */}
      <div className="auth-branding">

        <div className="branding-content">

          <div className="branding-logo">
            <img src={logo} alt="CareerOS" />
          </div>

          <div className="branding-name">
            CareerOS
          </div>

          <h2>
            Build Your
            <span> Career.</span>
          </h2>

          <p>
            Your intelligent career companion.
            Discover opportunities, build your skills,
            and take the next step toward your future.
          </p>

          <div className="feature-list">

            <div className="feature">
              <div className="feature-icon">✓</div>

              <div>
                <strong>Smart Career Guidance</strong>
                <small>
                  Personalized recommendations for your career.
                </small>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">✓</div>

              <div>
                <strong>Find Better Opportunities</strong>
                <small>
                  Discover jobs that match your skills.
                </small>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">✓</div>

              <div>
                <strong>Grow Your Skills</strong>
                <small>
                  Build the skills employers are looking for.
                </small>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Auth card */}
      <div className="auth-container">

        <div className="auth-card">

          {/* Logo */}
          <div className="auth-logo">
            <img src={logo} alt="CareerOS Logo" />
          </div>

          <div className="auth-brand-name">
            CareerOS
          </div>

          {/* Header */}
          <div className="auth-header">

            <h1>
              {isLogin
                ? "Welcome Back"
                : "Create Account"}
            </h1>

            <p>
              {isLogin
                ? "Sign in to continue to your account"
                : "Create your CareerOS account to get started"}
            </p>

          </div>

          {/* Tabs */}
          <div className="auth-tabs">

            <button
              type="button"
              className={isLogin ? "auth-tab active" : "auth-tab"}
              onClick={() => switchForm(true)}
            >
              Login
            </button>

            <button
              type="button"
              className={!isLogin ? "auth-tab active" : "auth-tab"}
              onClick={() => switchForm(false)}
            >
              Sign Up
            </button>

          </div>

          {/* LOGIN */}
          {isLogin ? (

            <form onSubmit={handleLogin}>

              <div className="form-group">

                <label htmlFor="login-email">
                  Email Address
                </label>

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={handleLoginChange}
                />

              </div>

              <div className="form-group">

                <div className="label-row">

                  <label htmlFor="login-password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => {
                      setError("");
                      setSuccess(
                        "Password reset functionality will be added soon."
                      );
                    }}
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="password-wrapper">

                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              <label className="checkbox-row">

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>

              {/* Error */}
              {error && (
                <div className="alert error-alert">
                  <span>⚠</span>
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="alert success-alert">
                  <span>✓</span>
                  {success}
                </div>
              )}

              <button
                className="submit-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Signing in…" : "Login"}
              </button>

              <p className="switch-text">
                Don't have an account?{" "}

                <button
                  type="button"
                  className="switch-button"
                  onClick={() => switchForm(false)}
                >
                  Create one
                </button>
              </p>

            </form>

          ) : (

            /* SIGNUP */

            <form onSubmit={handleSignup}>

              <div className="form-group">

                <label htmlFor="signup-name">
                  Full Name
                </label>

                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={signupData.name}
                  onChange={handleSignupChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="signup-email">
                  Email Address
                </label>

                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={signupData.email}
                  onChange={handleSignupChange}
                />

              </div>

              <div className="form-group">

                <label htmlFor="signup-password">
                  Password
                </label>

                <div className="password-wrapper">

                  <input
                    id="signup-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="At least 8 characters"
                    value={signupData.password}
                    onChange={handleSignupChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                {signupData.password &&
                  signupData.password.length < 8 && (
                    <div className="field-error">
                      ⚠ Password must be at least 8 characters
                    </div>
                  )}

                {signupData.password &&
                  signupData.password.length >= 8 && (
                    <div className="field-success">
                      ✓ Password is strong enough
                    </div>
                  )}

              </div>

              <div className="form-group">

                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <div className="password-wrapper">

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    className={
                      passwordsMismatch
                        ? "input-error"
                        : passwordsMatch
                        ? "input-success"
                        : ""
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

                {passwordsMismatch && (
                  <div className="field-error">
                    ⚠ Passwords do not match
                  </div>
                )}

                {passwordsMatch && (
                  <div className="field-success">
                    ✓ Passwords match
                  </div>
                )}

              </div>

              <label className="checkbox-row terms-row">

                <input
                  type="checkbox"
                  required
                />

                <span>
                  I agree to the{" "}
                  <a href="#terms">
                    Terms & Conditions
                  </a>
                </span>

              </label>

              {/* Error */}
              {error && (
                <div className="alert error-alert">
                  <span>⚠</span>
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="alert success-alert">
                  <span>✓</span>
                  {success}
                </div>
              )}

              <button
                className="submit-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Creating account…" : "Create Account"}
              </button>

              <p className="switch-text">
                Already have an account?{" "}

                <button
                  type="button"
                  className="switch-button"
                  onClick={() => switchForm(true)}
                >
                  Login
                </button>
              </p>

            </form>

          )}

        </div>

      </div>

    </div>
  );
}

export default Auth;