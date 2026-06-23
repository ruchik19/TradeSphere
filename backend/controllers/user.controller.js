import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// ==========================================
// CENTRALIZED HELPER: GENERATE & SAVE TOKENS
// ==========================================
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        
        // Use the instance methods we just built in the Mongoose Model!
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Attach the refresh token to the user document and save it to the DB
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Token Generation Error:", error);
        throw new Error("Something went wrong while generating tokens");
    }
};

// Centralized cookie configuration
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
};

// ==========================================
// 1. REGISTER USER
// ==========================================
export const signupUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existedUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existedUser) {
            return res.status(409).json({ error: "User with email or username already exists" });
        }

        // Create the user. The Mongoose pre-save hook automatically hashes the password!
        const user = await User.create({
            username,
            email,
            password,
            linkedBrokers: [],
            holdings: []
        });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        // Fetch the user again, explicitly stripping out the password and token from the response data
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        return res.status(201)
            .cookie("accessToken", accessToken, { ...cookieOptions, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) })
            .cookie("refreshToken", refreshToken, { ...cookieOptions, path: '/api/auth/refresh', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
            .json({
                success: true,
                message: "User registered successfully! 🎉",
                user: createdUser
            });

    } catch (error) {
        console.error("Signup Controller Error:", error);
        res.status(500).json({ error: "Internal server error during registration" });
    }
};

// ==========================================
// 2. LOGIN USER
// ==========================================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }

        // Use the Model method to compare passwords
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid user credentials" });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        return res.status(200)
            .cookie("accessToken", accessToken, { ...cookieOptions, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) })
            .cookie("refreshToken", refreshToken, { ...cookieOptions, path: '/api/auth/refresh', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
            .json({
                success: true,
                message: "User logged in successfully!",
                user: loggedInUser
            });

    } catch (error) {
        console.error("Login Controller Error:", error);
        res.status(500).json({ error: "Internal server error during login" });
    }
};

// ==========================================
// 3. REFRESH ACCESS TOKEN
// ==========================================
export const refreshSessionToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ error: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id);
        if (!user) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        // Security check: Ensure the cookie token matches the one saved in the database
        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(401).json({ error: "Refresh token is expired or used" });
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, { ...cookieOptions, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) })
            .cookie("refreshToken", newRefreshToken, { ...cookieOptions, path: '/api/auth/refresh', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
            .json({ success: true, message: "Access token refreshed silently" });

    } catch (error) {
        console.error("Token Refresh Error:", error);
        return res.status(401).json({ error: "Invalid session token. Re-authentication required." });
    }
};

// ==========================================
// 4. LOGOUT USER
// ==========================================
export const logoutUser = async (req, res) => {
    try {
        // Unset the refreshToken in the database so the old token can never be used again
        await User.findByIdAndUpdate(
            req.user._id, 
            { $unset: { refreshToken: 1 } },
            { new: true }
        );

        return res.status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", { ...cookieOptions, path: '/api/auth/refresh' })
            .json({ success: true, message: "User logged out successfully" });

    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ error: "Internal server error during logout" });
    }
};
export const getCurrentUser = async (req, res) => {
    try {
        // The `protect` middleware has already verified the cookie and attached the user to `req.user`
        // It also already stripped out the password, so it's perfectly safe to send!
        res.status(200).json({
            success: true,
            user: req.user,
            message: "User fetched successfully"
        });
    } catch (error) {
        console.error("Get Current User Error:", error);
        res.status(500).json({ error: "Internal server error fetching user profile" });
    }
};

// ==========================================
// 6. UPDATE ACCOUNT DETAILS
// ==========================================
export const updateAccountDetails = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username && !email) {
            return res.status(400).json({ error: "Please provide a username or email to update" });
        }

        // We use req.user._id because only logged-in users can update their own accounts
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    ...(username && { username }),
                    ...(email && { email })
                }
            },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        res.status(200).json({
            success: true,
            message: "Account details updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Account Error:", error);
        res.status(500).json({ error: "Internal server error updating account" });
    }
};
export const changeCurrentPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Ensure both fields are provided
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: "Both old and new passwords are required" });
        }

        // Fetch the user using the ID provided by the protect middleware
        const user = await User.findById(req.user._id);

        // Verify the old password using the Model's instance method
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid old password" });
        }

        // Assign the new password. The pre("save") hook in User.js will automatically hash it!
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({ 
            success: true, 
            message: "Password changed successfully" 
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ error: "Internal server error while changing password" });
    }
};
