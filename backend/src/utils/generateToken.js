import jwt from "jsonwebtoken";

const generateToken = (userId, role, rememberMe = false) => {
    return jwt.sign(
        {
            id: userId,
            role: role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: rememberMe ? "30d" : "1d"
        }
    );
};

export default generateToken;