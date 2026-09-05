import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import logo from "../../assets/logo.png";

function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Direction the active form should slide in from: "right" when moving
  // from Login -> Sign Up, "left" when moving from Sign Up -> Login.
  const [direction, setDirection] = useState("right");

  const [mousePosition, setMousePosition] = useState({
    x: 50,
    y: 50,
  });

  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

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
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [ripples, setRipples] = useState([]);

  // =========================================================
  // MOUSE TRACKING (background glow)
  // =========================================================

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // =========================================================
  // CARD 3D TILT
  // =========================================================

  const handleCardMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const ry = (px - 0.5) * 8;
    const rx = (0.5 - py) * 8;

    setTilt({ rx, ry });
  };

  const handleCardMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  // =========================================================
  // BUTTON RIPPLE
  // =========================================================

  const createRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now() + Math.random();

    setRipples((prev) => [...prev, { id, x, y, size }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  };

  // =========================================================
  // SWITCH LOGIN / SIGNUP
  // =========================================================

  const switchForm = (login) => {
    setDirection(login ? "left" : "right");
    setIsLogin(login);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSubmitting(false);
  };

  // =========================================================
  // LOGIN INPUT
  // =========================================================

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // SIGNUP INPUT
  // =========================================================

  const handleSignupChange = (e) => {
    const { name, value } = e.target;

    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // PASSWORD STRENGTH
  // =========================================================

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: "" };

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: "Weak" };
    if (score <= 3) return { level: 2, label: "Medium" };
    return { level: 3, label: "Strong" };
  };

  const strengthClassMap = {
    1: "filled-weak",
    2: "filled-medium",
    3: "filled-strong",
  };

  const strengthColorMap = {
    1: "#e5484d",
    2: "#f5a623",
    3: "#22a06b",
  };

  const passwordStrength = getPasswordStrength(signupData.password);

  // =========================================================
  // LOGIN
  // =========================================================

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
    setShowSuccessOverlay(true);

    setTimeout(() => {
      navigate("/role-selection");
    }, 1500);
  };

  // =========================================================
  // SIGNUP
  // =========================================================

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
    setShowSuccessOverlay(true);

    setTimeout(() => {
      navigate("/role-selection");
    }, 1500);
  };

  // =========================================================
  // PASSWORD VALIDATION
  // =========================================================

  const passwordsMatch =
    signupData.password &&
    signupData.confirmPassword &&
    signupData.password === signupData.confirmPassword;

  const passwordsMismatch =
    signupData.password &&
    signupData.confirmPassword &&
    signupData.password !== signupData.confirmPassword;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="auth-page"
      style={{
        "--mouse-x": `${mousePosition.x}%`,
        "--mouse-y": `${mousePosition.y}%`,
      }}
    >
      {/* =====================================================
          INTERACTIVE BACKGROUND
      ===================================================== */}

      <div className="cursor-glow" />
      <div className="ambient-grid" />

      <div className="background-circle circle-one" />
      <div className="background-circle circle-two" />
      <div className="background-circle circle-three" />

      <div className="floating-dot dot-one" />
      <div className="floating-dot dot-two" />
      <div className="floating-dot dot-three" />
      <div className="floating-dot dot-four" />

      {/* =====================================================
          LEFT BRANDING
      ===================================================== */}

      <div className="auth-branding">
        <div className="branding-content">

          {/* Logo */}
          <div className="branding-logo">
            <img src={logo} alt="CareerOS" />
          </div>

          <div className="branding-name">
            CareerOS
          </div>

          {/* Heading */}
          <h2>
            Build Your
            <span> Career.</span>
          </h2>

          {/* Description */}
          <p>
            Your intelligent career companion.
            Discover opportunities, build your skills,
            and take the next step toward your future.
          </p>

          {/* Career Path */}
          <div className="career-path">
            <div className="path-line" />

            <div className="path-node node-one">
              <span />
            </div>

            <div className="path-node node-two">
              <span />
            </div>

            <div className="path-node node-three">
              <span />
            </div>

            <div className="path-node node-four">
              <span />
            </div>
          </div>

          {/* Features */}
          <div className="feature-list">

            <div className="feature">
              <div className="feature-line" />

              <div className="feature-icon">
                ✓
              </div>

              <div className="feature-content">
                <strong>
                  Smart Career Guidance
                </strong>

                <small>
                  Personalized recommendations for your career.
                </small>
              </div>
            </div>

            <div className="feature">
              <div className="feature-line" />

              <div className="feature-icon">
                ✓
              </div>

              <div className="feature-content">
                <strong>
                  Find Better Opportunities
                </strong>

                <small>
                  Discover jobs that match your skills.
                </small>
              </div>
            </div>

            <div className="feature">
              <div className="feature-line" />

              <div className="feature-icon">
                ✓
              </div>

              <div className="feature-content">
                <strong>
                  Grow Your Skills
                </strong>

                <small>
                  Build the skills employers are looking for.
                </small>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          RIGHT AUTH AREA
      ===================================================== */}

      <div className="auth-container">

        <div
          className="card-tilt-wrapper"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          }}
        >

          <div className="auth-card" ref={cardRef}>

            {/* Card glow */}
            <div className="card-glow" />

            <div className="auth-card-content">

              {/* Success overlay */}
              {showSuccessOverlay && (
                <div className="success-overlay">
                  <svg
                    className="success-check"
                    viewBox="0 0 52 52"
                  >
                    <circle cx="26" cy="26" r="24" />
                    <path d="M14 27l7 7 17-17" />
                  </svg>

                  <p>{success}</p>
                </div>
              )}

              {/* =================================================
                  LOGO
              ================================================= */}

              <div className="auth-logo">
                <img
                  src={logo}
                  alt="CareerOS Logo"
                />
              </div>

              <div className="auth-brand-name">
                CareerOS
              </div>

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="auth-header">

                <h1 key={isLogin ? "login-title" : "signup-title"}>
                  {isLogin
                    ? "Welcome Back"
                    : "Create Account"}
                </h1>

                <p key={isLogin ? "login-description" : "signup-description"}>
                  {isLogin
                    ? "Sign in to continue to your account"
                    : "Create your CareerOS account to get started"}
                </p>

              </div>

              {/* =================================================
                  TABS
              ================================================= */}

              <div className="auth-tabs">

                <div
                  className={`tab-indicator ${isLogin ? "indicator-login" : "indicator-signup"
                    }`}
                />

                <button
                  type="button"
                  className={
                    isLogin
                      ? "auth-tab active"
                      : "auth-tab"
                  }
                  onClick={() => switchForm(true)}
                >
                  Login
                </button>

                <button
                  type="button"
                  className={
                    !isLogin
                      ? "auth-tab active"
                      : "auth-tab"
                  }
                  onClick={() => switchForm(false)}
                >
                  Sign Up
                </button>

              </div>

              {/* =================================================
                  LOGIN
              ================================================= */}

              {isLogin ? (

                <form
                  className={`auth-form form-login ${direction === "right" ? "slide-from-right" : "slide-from-left"
                    }`}
                  key="login-form"
                  onSubmit={handleLogin}
                >

                  {/* Email */}

                  <div className="form-group">

                    <label htmlFor="login-email">
                      Email Address
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        @
                      </span>

                      <input
                        id="login-email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        autoComplete="email"
                      />

                    </div>

                  </div>

                  {/* Password */}

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

                      <span className="input-icon">
                        •
                      </span>

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
                        autoComplete="current-password"
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        <span className="eye-icon">
                          {showPassword ? "◉" : "◌"}
                        </span>

                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>

                    </div>

                  </div>

                  {/* Remember me */}

                  <label className="checkbox-row">

                    <input type="checkbox" />

                    <span>
                      Remember me
                    </span>

                  </label>

                  {/* Error */}

                  {error && (
                    <div className="alert error-alert">
                      <span className="alert-icon">
                        !
                      </span>

                      <span>
                        {error}
                      </span>
                    </div>
                  )}

                  {/* Success */}

                  {success && !showSuccessOverlay && (
                    <div className="alert success-alert">
                      <span className="alert-icon">
                        ✓
                      </span>

                      <span>
                        {success}
                      </span>
                    </div>
                  )}

                  {/* Submit */}

                  <button
                    className="submit-button"
                    type="submit"
                    disabled={submitting}
                    onMouseDown={createRipple}
                  >
                    <span className="button-shine" />

                    {ripples.map((r) => (
                      <span
                        key={r.id}
                        className="ripple"
                        style={{
                          left: r.x,
                          top: r.y,
                          width: r.size,
                          height: r.size,
                        }}
                      />
                    ))}

                    {submitting ? (
                      <span className="button-loading">
                        <span className="spinner" />
                        Signing in...
                      </span>
                    ) : (
                      <>
                        <span>
                          Login
                        </span>

                        <span className="button-arrow">
                          →
                        </span>
                      </>
                    )}
                  </button>

                  {/* Switch */}

                  <p className="switch-text">
                    Don't have an account?{" "}

                    <button
                      type="button"
                      className="switch-button"
                      onClick={() =>
                        switchForm(false)
                      }
                    >
                      Create one
                      <span> →</span>
                    </button>
                  </p>

                </form>

              ) : (

                /* =================================================
                   SIGNUP
                ================================================= */

                <form
                  className={`auth-form form-signup ${direction === "right" ? "slide-from-right" : "slide-from-left"
                    }`}
                  key="signup-form"
                  onSubmit={handleSignup}
                >

                  {/* Name */}

                  <div className="form-group">

                    <label htmlFor="signup-name">
                      Full Name
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        ✦
                      </span>

                      <input
                        id="signup-name"
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={signupData.name}
                        onChange={handleSignupChange}
                        autoComplete="name"
                      />

                    </div>

                  </div>

                  {/* Email */}

                  <div className="form-group">

                    <label htmlFor="signup-email">
                      Email Address
                    </label>

                    <div className="input-wrapper">

                      <span className="input-icon">
                        @
                      </span>

                      <input
                        id="signup-email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        autoComplete="email"
                      />

                    </div>

                  </div>

                  {/* Password */}

                  <div className="form-group">

                    <label htmlFor="signup-password">
                      Password
                    </label>

                    <div className="password-wrapper">

                      <span className="input-icon">
                        •
                      </span>

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
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        <span className="eye-icon">
                          {showPassword ? "◉" : "◌"}
                        </span>

                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>

                    </div>

                    {signupData.password &&
                      signupData.password.length < 8 && (
                        <div className="field-error">
                          <span>!</span>
                          Password must be at least 8 characters
                        </div>
                      )}

                    {signupData.password &&
                      signupData.password.length >= 8 && (
                        <div className="strength-wrapper">
                          <div className="strength-meter">
                            {[1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={`strength-bar ${step <= passwordStrength.level
                                  ? strengthClassMap[passwordStrength.level]
                                  : ""
                                  }`}
                              />
                            ))}
                          </div>

                          <div
                            className="strength-label"
                            style={{
                              color: strengthColorMap[passwordStrength.level],
                            }}
                          >
                            {passwordStrength.label} password
                          </div>
                        </div>
                      )}

                  </div>

                  {/* Confirm Password */}

                  <div className="form-group">

                    <label htmlFor="confirm-password">
                      Confirm Password
                    </label>

                    <div className="password-wrapper">

                      <span className="input-icon">
                        •
                      </span>

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
                        autoComplete="new-password"
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
                        <span className="eye-icon">
                          {showConfirmPassword
                            ? "◉"
                            : "◌"}
                        </span>

                        {showConfirmPassword
                          ? "Hide"
                          : "Show"}
                      </button>

                    </div>

                    {passwordsMismatch && (
                      <div className="field-error">
                        <span>!</span>
                        Passwords do not match
                      </div>
                    )}

                    {passwordsMatch && (
                      <div className="field-success">
                        <span>✓</span>
                        Passwords match
                      </div>
                    )}

                  </div>

                  {/* Terms */}

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
                      <span className="alert-icon">
                        !
                      </span>

                      <span>
                        {error}
                      </span>
                    </div>
                  )}

                  {/* Success */}

                  {success && !showSuccessOverlay && (
                    <div className="alert success-alert">
                      <span className="alert-icon">
                        ✓
                      </span>

                      <span>
                        {success}
                      </span>
                    </div>
                  )}

                  {/* Submit */}

                  <button
                    className="submit-button"
                    type="submit"
                    disabled={submitting}
                    onMouseDown={createRipple}
                  >
                    <span className="button-shine" />

                    {ripples.map((r) => (
                      <span
                        key={r.id}
                        className="ripple"
                        style={{
                          left: r.x,
                          top: r.y,
                          width: r.size,
                          height: r.size,
                        }}
                      />
                    ))}

                    {submitting ? (
                      <span className="button-loading">
                        <span className="spinner" />
                        Creating account...
                      </span>
                    ) : (
                      <>
                        <span>
                          Create Account
                        </span>

                        <span className="button-arrow">
                          →
                        </span>
                      </>
                    )}
                  </button>

                  {/* Switch */}

                  <p className="switch-text">
                    Already have an account?{" "}

                    <button
                      type="button"
                      className="switch-button"
                      onClick={() =>
                        switchForm(true)
                      }
                    >
                      Login
                      <span> →</span>
                    </button>
                  </p>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Auth;
