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
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Token Generation Error:", error);
        throw new Error("Something went wrong while generating tokens");
    }
};

// Centralized VIP Cookie Configuration
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
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

        const user = await User.create({
            username,
            email,
            password,
            linkedBrokers: [],
            holdings: []
        });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
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
        await User.findByIdAndUpdate(
            req.user._id, 
            { $unset: { refreshToken: 1 } },
            { returnDocument: 'after' } // <-- Fixed the Mongoose warning here!
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

// ==========================================
// 5. GET CURRENT USER
// ==========================================
export const getCurrentUser = async (req, res) => {
    try {
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

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    ...(username && { username }),
                    ...(email && { email })
                }
            },
            { returnDocument: 'after', runValidators: true } // <-- Fixed Mongoose warning here too!
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

// ==========================================
// 7. CHANGE PASSWORD
// ==========================================
export const changeCurrentPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: "Both old and new passwords are required" });
        }

        const user = await User.findById(req.user._id);

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid old password" });
        }

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