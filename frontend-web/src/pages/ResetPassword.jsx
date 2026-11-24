import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `http://localhost:5000/api/v1/auth/reset-password/${token}`,
                {
                    password,
                    confirmPassword
                }
            );

            setMessage(
                response.data.message || "Password reset successfully!"
            );

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reset password. Your link may have expired."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-page">

            <div className="reset-card">

                <div className="reset-icon">🔐</div>

                <h1>Reset Password</h1>

                <p className="reset-description">
                    Create a new password for your AccessAble account.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="reset-input-group">
                        <label>New Password</label>

                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="reset-input-group">
                        <label>Confirm Password</label>

                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    {error && (
                        <div className="reset-error">{error}</div>
                    )}

                    {message && (
                        <div className="reset-success">{message}</div>
                    )}

                    <button
                        type="submit"
                        className="reset-submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>

                </form>

                <Link to="/login" className="reset-back-link">
                    ← Back to Login
                </Link>

            </div>

        </div>
    );
}

export default ResetPassword;