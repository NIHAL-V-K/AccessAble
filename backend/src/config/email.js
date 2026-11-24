import nodemailer from "nodemailer";
import "dotenv/config";

const email = process.env.EMAIL_USER?.trim();
const password = process.env.EMAIL_PASS?.replace(/\s/g, "");

if (!email || !password) {
    throw new Error("Email credentials are missing.");
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        type: "LOGIN",
        user: email,
        pass: password
    }
});

export default transporter;