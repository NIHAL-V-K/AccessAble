import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import { Accessibility } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
    setSuccess("");
  };

  // PASSWORD STRENGTH
  const getPasswordStrength = () => {
    const password = formData.password;

    if (!password) return 0;

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const passwordStrength = getPasswordStrength();

  // VALIDATE FORM
  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();

    // NAME VALIDATION
    if (!name) {
      return "Please enter your full name.";
    }

    if (name.length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (!/^[\p{L}][\p{L}\s'-]*$/u.test(name)) {
      return "Name can contain only letters, spaces, hyphens and apostrophes.";
    }

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!email) {
      return "Please enter your email address.";
    }

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    // DEPARTMENT VALIDATION
    if (!formData.department) {
      return "Please select your department.";
    }

    // PASSWORD VALIDATION
    if (formData.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(formData.password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(formData.password)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(formData.password)) {
      return "Password must contain at least one number.";
    }

    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      return "Password must contain at least one special character.";
    }

    // CONFIRM PASSWORD
    if (!formData.confirmPassword) {
      return "Please confirm your password.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    // TERMS
    if (!acceptedTerms) {
      return "Please accept the terms and conditions.";
    }

    return "";
  };

  // SUBMIT REGISTRATION
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/register",
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          department: formData.department
        }
      );

      if (response.data.success) {
        // DO NOT AUTOMATICALLY LOG IN THE USER
        // DO NOT SAVE REGISTRATION TOKEN OR USER IN LOCAL STORAGE

        setSuccess(
          "Account created successfully! Redirecting you to login..."
        );

        // Clear registration form
        setFormData({
          name: "",
          email: "",
          department: "",
          password: "",
          confirmPassword: ""
        });

        setAcceptedTerms(false);

        // Redirect to login after successful registration
        setTimeout(() => {
          navigate("/login", {
            state: {
              registrationSuccess: true,
              email: response.data.user?.email || ""
            }
          });
        }, 1500);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* LEFT SECTION */}

      <div className="register-left">

        <Link to="/" className="register-logo">
          <span className="register-logo-icon">
    <Accessibility size={25} strokeWidth={2.5} />
</span>
<span className="register-logo-text">
    access<span>able</span>
</span>
        </Link>

        <div className="register-left-content">

          <span className="register-tag">
            ✦ Join our community
          </span>

          <h1>
            A more inclusive
            <br />
            <span>digital world</span>
            <br />
            starts with you.
          </h1>

          <p>
            Create your account and discover a learning
            environment designed to make technology
            accessible to everyone.
          </p>

          <div className="register-benefits">

            <div className="benefit-item">
              <span>✓</span>
              Personalized learning experience
            </div>

            <div className="benefit-item">
              <span>✓</span>
              Assistive accessibility tools
            </div>

            <div className="benefit-item">
              <span>✓</span>
              Inclusive digital environment
            </div>

          </div>

        </div>

        <div className="register-footer">
          Different abilities. Equal opportunities.
        </div>

      </div>

      {/* RIGHT SECTION */}

      <div className="register-right">

        <div className="register-form-container">

          <div className="register-mobile-logo">
            <Link to="/" className="register-logo">
              <span className="register-logo-icon">♿</span>
              accessable
            </Link>
          </div>

          <div className="register-heading">

            <span>CREATE YOUR ACCOUNT</span>

            <h2>Join AccessAble</h2>

            <p>
              Let's get you started with your journey.
            </p>

          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* FULL NAME */}

            <div className="register-form-group">

              <label htmlFor="name">Full name</label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />

            </div>

            {/* EMAIL */}

            <div className="register-form-group">

              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />

            </div>

            {/* DEPARTMENT */}

            <div className="register-form-group">

              <label htmlFor="department">Department</label>

              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >

                <option value="">Select your department</option>
                <option value="MCA">MCA</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Electronics">Electronics</option>
                <option value="Other">Other</option>

              </select>

            </div>

            {/* PASSWORD */}

            <div className="register-form-group">

              <label htmlFor="password">Password</label>

              <div className="register-password-wrapper">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

              {/* PASSWORD STRENGTH */}

              {formData.password && (

                <div className="password-strength">

                  <div className="strength-bars">

                    {[1, 2, 3, 4, 5].map((level) => (

                      <div
                        key={level}
                        className={
                          level <= passwordStrength
                            ? `strength-bar strength-${passwordStrength}`
                            : "strength-bar"
                        }
                      />

                    ))}

                  </div>

                  <span>
                    {
                      passwordStrength <= 2
                        ? "Weak password"
                        : passwordStrength <= 4
                        ? "Good password"
                        : "Strong password"
                    }
                  </span>

                </div>

              )}

              <small className="register-validation-hint">
                Use 8+ characters with uppercase, lowercase,
                a number and a special character.
              </small>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="register-form-group">

              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="register-password-wrapper">

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>

              </div>

              {formData.confirmPassword && (
                <small
                  className="register-validation-hint"
                  style={{
                    color:
                      formData.password === formData.confirmPassword
                        ? "green"
                        : "#d9534f"
                  }}
                >
                  {formData.password === formData.confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </small>
              )}

            </div>

            {/* TERMS */}

            <label className="register-terms">

              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  setError("");
                }}
              />

              <span>
                I agree to the terms of service and privacy policy.
              </span>

            </label>

            {/* MESSAGES */}

            {error && (
              <div className="register-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="register-success" role="status">
                {success}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >

              {loading
                ? "Creating account..."
                : "Create account →"}

            </button>

          </form>

          <div className="register-login-link">

            Already have an account?

            <Link to="/login"> Sign in</Link>

          </div>

          <div className="register-bottom-note">
            Designed around people. Built for everyone.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;
