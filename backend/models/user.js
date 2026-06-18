import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const brokerAuthSchema = new mongoose.Schema({
    broker: { 
        type: String, 
        required: true, 
        enum: ['Upstox', 'Groww', 'Zerodha'] 
    },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    authCode: { type: String },
    lastSync: { type: Date },
    expiresAt: { type: Date }
}, { _id: false });

const assetSchema = new mongoose.Schema({
    ticker: { type: String, required: true, uppercase: true, trim: true },
    companyName: { type: String, required: true },
    quantity: { type: Number, required: true, min: [1, 'Quantity cannot be less than 1'] },
    avgBuyPrice: { type: Number, required: true },
    sector: { type: String, required: true },
    broker: { 
        type: String, 
        required: true, 
        enum: ['Upstox', 'Groww', 'Angel One', 'Zerodha', 'Manual'], 
        default: 'Manual' 
    }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'password is required'] },
    refreshToken: { type: String },
    linkedBrokers: { type: [String], default: [] },
    watchlist: { type: [String], default: [] },
    virtualBalance: { type: Number, default: 100000 },
    paperHoldings: [{
        ticker: { type: String, required: true },
        quantity: { type: Number, required: true },
        avgBuyPrice: { type: Number, required: true },
        sector: { type: String }
    }],
    transactionHistory: [{
        type: { type: String, enum: ['BUY', 'SELL'], required: true },
        ticker: { type: String, required: true },
        quantity: { type: Number, required: true },
        executionPrice: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        date: { type: Date, default: Date.now }
    }],
    holdings: [assetSchema],
    brokerAuths: [brokerAuthSchema]
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, username: this.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

const User = mongoose.model('User', userSchema);
export default User;