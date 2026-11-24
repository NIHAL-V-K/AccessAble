import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {

    const databaseStatus =
        mongoose.connection.readyState === 1
            ? "Connected"
            : "Disconnected";

    res.status(200).json({
        success: true,
        message: "Welcome to AccessAble API",
        application: "AccessAble",
        version: "1.0.0",
        database: databaseStatus,
        timestamp: new Date().toISOString()
    });

});

export default router;