import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ForgotPassword.css";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/v1/auth/forgot-password",
                {
                    email: email.trim().toLowerCase()
                }
            );

            setMessage(
                response.data.message ||
                "If an account exists with this email, a password reset link has been sent."
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to send reset link. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-page">

            <div className="forgot-card">

                <div className="forgot-icon">
                    🔐
                </div>

                <h1>Forgot Password?</h1>

                <p className="forgot-description">
                    Don't worry! Enter your registered email address
                    and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="forgot-input-group">

                        <label htmlFor="forgot-email">
                            Email Address
                        </label>

                        <input
                            id="forgot-email"
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                    </div>

                    {error && (
                        <div className="forgot-error">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="forgot-success">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="forgot-submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                </form>

                <button
                    className="forgot-back-btn"
                    onClick={() => navigate("/login")}
                >
                    ← Back to Login
                </button>

            </div>

        </div>
    );
}

export default ForgotPassword;