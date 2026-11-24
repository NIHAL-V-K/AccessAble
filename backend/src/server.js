import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDatabase from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env");
        }

        await connectDatabase();

        app.listen(PORT, () => {
            console.log("----------------------------------");
            console.log("ACCESSABLE BACKEND STARTED");
            console.log("----------------------------------");
            console.log(`Server: http://localhost:${PORT}`);
            console.log("----------------------------------");
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();