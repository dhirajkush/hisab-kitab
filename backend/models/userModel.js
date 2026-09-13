import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // not required for accounts created via Google Sign-In
        required: function () {
            return !this.googleId;
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    profilePic: {
        type: String,
        default: ""
    },
    // bcrypt hash of the current refresh token, not the raw token itself
    refreshTokenHash: {
        type: String,
        default: null,
        select: false
    }
});

const userModel = mongoose.models.user || mongoose.model('User', userSchema);
export default userModel;
