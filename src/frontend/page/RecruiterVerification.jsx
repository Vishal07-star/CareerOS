import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./RecruiterVerification.css";

/* =========================
   SVG ICONS
========================= */

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="rv-svg-icon"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m4 7 8 6 8-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="rv-svg-icon"
  >
    <path
      d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M16 9h3a1 1 0 0 1 1 1v11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M8 7h4M8 11h4M8 15h4M19 15h1M19 18h1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M2 21h20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="rv-svg-icon"
  >
    <rect
      x="3"
      y="7"
      width="18"
      height="13"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M3 12h18M10 12v2h4v-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="rv-svg-icon"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21M12 3c-2.3 2.5-3.5 5.5-3.5 9S9.7 18.5 12 21"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="rv-large-icon"
  >
    <path
      d="M12 3 20 6v5c0 5.2-3.4 8.8-8 10-4.6-1.2-8-4.8-8-10V6l8-3Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="m8.5 12 2.2 2.2 4.8-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="rv-small-icon"
  >
    <rect
      x="5"
      y="10"
      width="14"
      height="11"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M8 10V7a4 4 0 0 1 8 0v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="rv-check-icon"
  >
    <path
      d="m6 12 4 4 8-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="rv-arrow-icon"
  >
    <path
      d="M5 12h13M13 6l6 6-6 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* =========================
   COMPONENT
========================= */

export default function RecruiterVerification() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [error, setError] = useState("");

  const otpRefs = useRef([]);

  const [formData, setFormData] = useState({
    workEmail: "",
    companyName: "",
    jobTitle: "",
    companyWebsite: "",
  });

  /* =========================
     FORM CHANGE
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  /* =========================
     SEND OTP
  ========================= */

  const handleSendOTP = (e) => {
    e.preventDefault();

    if (!formData.workEmail.trim()) {
      setError("Please enter your work email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail.trim())) {
      setError("Please enter a valid work email address.");
      return;
    }

    if (!formData.companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }

    if (!formData.jobTitle.trim()) {
      setError("Please enter your job title.");
      return;
    }

    if (
      formData.companyWebsite.trim() &&
      !/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}([/?#].*)?$/i.test(
        formData.companyWebsite.trim()
      )
    ) {
      setError("Please enter a valid company website.");
      return;
    }

    setError("");

    setOtp([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    setStep(2);

    setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 100);
  };

  /* =========================
     OTP CHANGE
  ========================= */

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, "");

    if (!cleanValue) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];

    /* Handle paste */
    if (cleanValue.length > 1) {
      const digits = cleanValue.slice(0, 6).split("");

      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);
      setError("");

      const nextIndex = Math.min(
        index + digits.length,
        5
      );

      setTimeout(() => {
        otpRefs.current[nextIndex]?.focus();
      }, 0);

      return;
    }

    newOtp[index] = cleanValue;

    setOtp(newOtp);
    setError("");

    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  /* =========================
     OTP KEYBOARD
  ========================= */

  const handleOtpKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }

    if (
      e.key === "ArrowLeft" &&
      index > 0
    ) {
      e.preventDefault();
      otpRefs.current[index - 1]?.focus();
    }

    if (
      e.key === "ArrowRight" &&
      index < 5
    ) {
      e.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  /* =========================
     VERIFY OTP
  ========================= */

  const handleVerifyOTP = (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError(
        "Please enter the complete 6-digit verification code."
      );
      return;
    }

    if (enteredOtp !== "123456") {
      setError(
        "Invalid verification code. For demo use 123456."
      );
      return;
    }

    setError("");
    setStep(3);
  };

  /* =========================
     RESEND
  ========================= */

  const handleResend = () => {
    setOtp([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    setError("");

    setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 100);
  };

  /* =========================
     BACK TO INFORMATION
  ========================= */

  const handleChangeEmail = () => {
    setStep(1);

    setOtp([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    setError("");
  };

  /* =========================
     CONTINUE
  ========================= */

  const handleContinue = () => {
    navigate("/recruiter/dashboard");
  };

  return (
    <div className="rv-page">

      {/* BACKGROUND */}

      <div className="rv-bg-glow rv-bg-glow-1" />
      <div className="rv-bg-glow rv-bg-glow-2" />
      <div className="rv-bg-glow rv-bg-glow-3" />

      <div className="rv-background-grid" />

      {/* CARD */}

      <main className="rv-card">

        {/* =====================
            BRAND
        ====================== */}

        <div className="rv-brand">

          <div className="rv-brand-logo">
            <span>C</span>
          </div>

          <div className="rv-brand-text">
            <strong>CareerOS</strong>
            <span>Hiring Management</span>
          </div>

        </div>

        {/* =====================
            STEP INDICATOR
        ====================== */}

        <div className="rv-progress">

          <div
            className={`rv-progress-step ${
              step >= 1 ? "is-active" : ""
            } ${step > 1 ? "is-complete" : ""}`}
          >
            <div className="rv-step-circle">
              {step > 1 ? (
                <CheckIcon />
              ) : (
                "1"
              )}
            </div>

            <span>Information</span>
          </div>

          <div
            className={`rv-progress-line ${
              step > 1 ? "is-active" : ""
            }`}
          />

          <div
            className={`rv-progress-step ${
              step >= 2 ? "is-active" : ""
            } ${step > 2 ? "is-complete" : ""}`}
          >
            <div className="rv-step-circle">
              {step > 2 ? (
                <CheckIcon />
              ) : (
                "2"
              )}
            </div>

            <span>Email OTP</span>
          </div>

          <div
            className={`rv-progress-line ${
              step > 2 ? "is-active" : ""
            }`}
          />

          <div
            className={`rv-progress-step ${
              step >= 3 ? "is-active" : ""
            }`}
          >
            <div className="rv-step-circle">
              {step >= 3 ? (
                <CheckIcon />
              ) : (
                "3"
              )}
            </div>

            <span>Complete</span>
          </div>

        </div>

        {/* =====================
            STEP 1
        ====================== */}

        {step === 1 && (
          <section className="rv-content">

            <div className="rv-header">

              <div className="rv-icon-box">
                <ShieldIcon />
              </div>

              <div className="rv-eyebrow">
                RECRUITER VERIFICATION
              </div>

              <h1>
                Verify your recruiter
                <span> account</span>
              </h1>

              <p>
                Confirm your professional identity to unlock
                CareerOS hiring and recruitment tools.
              </p>

            </div>

            <form
              className="rv-form"
              onSubmit={handleSendOTP}
            >

              {/* EMAIL */}

              <div className="rv-field rv-field-full">

                <label htmlFor="workEmail">
                  Work Email
                  <b>*</b>
                </label>

                <div className="rv-input-wrap">

                  <span className="rv-input-icon">
                    <MailIcon />
                  </span>

                  <input
                    id="workEmail"
                    type="email"
                    name="workEmail"
                    placeholder="you@company.com"
                    value={formData.workEmail}
                    onChange={handleChange}
                    autoComplete="email"
                  />

                </div>

              </div>

              {/* COMPANY + JOB */}

              <div className="rv-form-row">

                <div className="rv-field">

                  <label htmlFor="companyName">
                    Company Name
                    <b>*</b>
                  </label>

                  <div className="rv-input-wrap">

                    <span className="rv-input-icon">
                      <BuildingIcon />
                    </span>

                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      placeholder="Your company"
                      value={formData.companyName}
                      onChange={handleChange}
                      autoComplete="organization"
                    />

                  </div>

                </div>

                <div className="rv-field">

                  <label htmlFor="jobTitle">
                    Job Title
                    <b>*</b>
                  </label>

                  <div className="rv-input-wrap">

                    <span className="rv-input-icon">
                      <BriefcaseIcon />
                    </span>

                    <input
                      id="jobTitle"
                      type="text"
                      name="jobTitle"
                      placeholder="Recruiter"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      autoComplete="organization-title"
                    />

                  </div>

                </div>

              </div>

              {/* WEBSITE */}

              <div className="rv-field rv-field-full">

                <label htmlFor="companyWebsite">

                  <span>
                    Company Website
                  </span>

                  <em>
                    Optional
                  </em>

                </label>

                <div className="rv-input-wrap">

                  <span className="rv-input-icon">
                    <GlobeIcon />
                  </span>

                  <input
                    id="companyWebsite"
                    type="url"
                    name="companyWebsite"
                    placeholder="https://company.com"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    autoComplete="url"
                  />

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="rv-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              {/* BUTTON */}

              <button
                type="submit"
                className="rv-button"
              >
                <span>
                  Send Verification Code
                </span>

                <ArrowIcon />
              </button>

            </form>

            {/* SECURITY */}

            <div className="rv-security">

              <div className="rv-security-icon">
                <LockIcon />
              </div>

              <div>
                <strong>
                  Secure & encrypted
                </strong>

                <p>
                  Your professional information is securely
                  handled and never shared without permission.
                </p>
              </div>

            </div>

            {/* BACK */}

            <button
              type="button"
              className="rv-back"
              onClick={() =>
                navigate("/role-selection")
              }
            >
              <span>←</span>
              Back to role selection
            </button>

          </section>
        )}

        {/* =====================
            STEP 2 OTP
        ====================== */}

        {step === 2 && (
          <section className="rv-content rv-otp-content">

            <div className="rv-header">

              <div className="rv-icon-box rv-email-icon">
                <MailIcon />
              </div>

              <div className="rv-eyebrow">
                EMAIL VERIFICATION
              </div>

              <h1>
                Check your
                <span> email</span>
              </h1>

              <p>
                We've sent a 6-digit verification code to
              </p>

              <div className="rv-email-display">
                <MailIcon />
                <span>{formData.workEmail}</span>
              </div>

            </div>

            <form
              className="rv-otp-form"
              onSubmit={handleVerifyOTP}
            >

              <div className="rv-otp-label">
                Enter verification code
              </div>

              <div className="rv-otp-boxes">

                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    className={`rv-otp-box ${
                      digit ? "filled" : ""
                    } ${error ? "has-error" : ""}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    aria-label={`OTP digit ${index + 1}`}
                    onChange={(e) =>
                      handleOtpChange(
                        index,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      handleOtpKeyDown(index, e)
                    }
                    onFocus={(e) =>
                      e.target.select()
                    }
                  />
                ))}

              </div>

              {error && (
                <div className="rv-error rv-otp-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="rv-button"
              >
                <span>
                  Verify Email
                </span>

                <ArrowIcon />
              </button>

            </form>

            <div className="rv-resend">

              <span>
                Didn't receive the code?
              </span>

              <button
                type="button"
                onClick={handleResend}
              >
                Resend Code
              </button>

            </div>

            <button
              type="button"
              className="rv-back"
              onClick={handleChangeEmail}
            >
              <span>←</span>
              Change email
            </button>

            <div className="rv-demo">

              <span>DEMO MODE</span>

              <p>
                Verification code:
                <strong>123456</strong>
              </p>

            </div>

          </section>
        )}

        {/* =====================
            STEP 3 SUCCESS
        ====================== */}

        {step === 3 && (
          <section className="rv-content rv-success-content">

            <div className="rv-success-icon">
              <CheckIcon />
            </div>

            <div className="rv-eyebrow">
              VERIFICATION COMPLETE
            </div>

            <h1>
              Recruiter
              <span> Verified!</span>
            </h1>

            <p className="rv-success-description">
              Your professional identity has been successfully
              verified. CareerOS hiring tools are now ready
              for you.
            </p>

            <div className="rv-company-card">

              <div className="rv-company-avatar">
                {formData.companyName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="rv-company-info">

                <strong>
                  {formData.companyName}
                </strong>

                <span>
                  {formData.jobTitle}
                </span>

                <small>
                  {formData.workEmail}
                </small>

              </div>

              <div className="rv-verified-badge">
                <CheckIcon />
                Verified
              </div>

            </div>

            <div className="rv-success-list">

              <div>
                <span>
                  <CheckIcon />
                </span>
                Verified work email
              </div>

              <div>
                <span>
                  <CheckIcon />
                </span>
                Recruiter identity confirmed
              </div>

              <div>
                <span>
                  <CheckIcon />
                </span>
                Hiring dashboard unlocked
              </div>

            </div>

            <button
              type="button"
              className="rv-button"
              onClick={handleContinue}
            >
              <span>
                Continue to Recruiter Dashboard
              </span>

              <ArrowIcon />
            </button>

          </section>
        )}

        {/* FOOTER */}

        <footer className="rv-footer">

          <span>CareerOS</span>

          <i>•</i>

          <span>
            Secure recruiter verification
          </span>

        </footer>

      </main>
    </div>
  );
}