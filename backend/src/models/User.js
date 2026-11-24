import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false
        },

        role: {
            type: String,
            enum: [
                "student",
                "lecturer",
                "admin",
                "maintenance"
            ],
            default: "student"
        },

        isActive: {
            type: Boolean,
            default: true
        },

        profileImage: {
            type: String,
            default: ""
        },

        department: {
            type: String,
            default: ""
        },

        // PASSWORD RESET FIELDS
        resetPasswordToken: {
            type: String,
            default: undefined,
            select: false
        },

        resetPasswordExpires: {
            type: Date,
            default: undefined,
            select: false
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function () {

    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {

    return await bcrypt.compare(
        enteredPassword,
        this.password
    );

};

const User = mongoose.model("User", userSchema);

export default User;
