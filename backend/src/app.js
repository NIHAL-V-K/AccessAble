import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Existing Routes
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";

// NEW: AI Routes
import aiRoutes from "./routes/ai.routes.js";

const app = express();

// ========================================
// SECURITY
// ========================================

app.use(helmet());

// ========================================
// CORS
// ========================================

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ========================================
// MAIN API
// ========================================

app.get("/", (req, res) => {

    res.json({
        message: "AccessAble Universal Accessibility Platform",
        status: "Running"
    });

});

// ========================================
// HEALTH API
// ========================================

app.use("/api/v1/health", healthRoutes);

// ========================================
// AUTHENTICATION API
// ========================================

app.use("/api/v1/auth", authRoutes);

// ========================================
// AI ASSISTANT API
// ========================================

app.use("/api/v1/ai", aiRoutes);

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });

});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

});

export default app;