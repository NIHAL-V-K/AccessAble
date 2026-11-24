import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import transporter from "../config/email.js";
import crypto from "crypto";

// ==========================================
// REGISTER USER
// ==========================================

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, department } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must contain at least 2 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            department: department?.trim() || "",
            role: "student"
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        console.error("Registration Error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
};


// ==========================================
// LOGIN USER
// ==========================================

export const loginUser = async (req, res) => {
    try {
        const {
            email,
            password,
            rememberMe = false
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated"
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(
            user._id,
            user.role,
            rememberMe === true
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};


// ==========================================
// FORGOT PASSWORD
// ==========================================

export const forgotPassword = async (req, res) => {
    let user;

    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user
        user = await User.findOne({
            email: normalizedEmail
        });

        // Generic response prevents email enumeration
        const responseMessage =
            "If an account exists with this email, a password reset link will be sent.";

        if (!user || !user.isActive) {
            return res.status(200).json({
                success: true,
                message: responseMessage
            });
        }

        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token before storing in database
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Save token and expiry
        user.resetPasswordToken = hashedToken;

        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        // Create password reset link
        const resetURL =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Send reset email
        await transporter.sendMail({
            from: `"AccessAble" <${process.env.EMAIL_USER}>`,

            to: user.email,

            subject: "AccessAble - Password Reset Request",

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    background: #f8f8f1;
                    border-radius: 12px;
                ">

                    <h2 style="color: #183f32;">
                        Reset Your AccessAble Password
                    </h2>

                    <p>Hello ${user.name},</p>

                    <p>
                        We received a request to reset your AccessAble
                        account password.
                    </p>

                    <p>
                        Click the button below to create a new password.
                    </p>

                    <a href="${resetURL}" style="
                        display: inline-block;
                        padding: 14px 25px;
                        background: #183f32;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                    ">
                        Reset Password
                    </a>

                    <p style="margin-top: 25px;">
                        This link expires in 15 minutes and can only
                        be used once.
                    </p>

                    <p>
                        If you did not request this reset, you can
                        safely ignore this email.
                    </p>

                    <p>Regards,<br>AccessAble Team</p>

                </div>
            `
        });

        return res.status(200).json({
            success: true,
            message: responseMessage
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);

        // Remove unused reset token if email delivery fails
        if (user) {
            try {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                await user.save();
            } catch (cleanupError) {
                console.error(
                    "Reset token cleanup failed:",
                    cleanupError
                );
            }
        }

        return res.status(500).json({
            success: false,
            message: "Unable to process password reset. Please try again."
        });
    }
};


// ==========================================
// RESET PASSWORD
// ==========================================

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Password reset token is required"
            });
        }

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Both password fields are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // Hash the received token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with matching, unexpired token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        }).select("+resetPasswordToken +resetPasswordExpires");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Password reset link is invalid or expired"
            });
        }

        // Update password
        // Existing pre-save middleware automatically hashes it.
        user.password = password;

        // Invalidate reset token after successful use
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful. Please login with your new password."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reset password. Please try again."
        });
    }
};


// ==========================================
// GET CURRENT USER PROFILE
// ==========================================

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to retrieve profile"
        });
    }
};