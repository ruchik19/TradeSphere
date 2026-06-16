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
    expiresAt: { type: Date }// Useful to know when to refresh the token
}, { _id: false });
const assetSchema = new mongoose.Schema({
    ticker: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    companyName:{
        type: String,
        required: true,
    },
    quantity:{
        type: Number,
        required: true,
        min: [1,'Quantity cannot be less than 1']
    },
    avgBuyPrice: {
        type: Number,
        required: true,
    },
    sector:{
        type:String,
        required: true
    },
    broker: {
        type: String,
        required: true,
        enum: ['Upstox','Groww','Angel One','Zerodha','Manual'],
        default: 'Manual'
    }
},{timestamps: true});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
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
        required: [true, 'password is required'],
    },
    refreshToken: {
        type: String 
    },
    linkedBrokers: {
        type: [String],
        default: []
    },
    watchlist: {           // <-- ADDED HERE
        type: [String],    // Stores an array of ticker strings (e.g., 'TCS.NS', 'RELIANCE.NS')
        default: []        // Ensures new users start with an empty watchlist instead of undefined
    },
    virtualBalance: {
        type: Number,
        default: 100000 // Every user starts with ₹1,00,000 virtual cash
    },
    paperHoldings: [{
        ticker: { type: String, required: true },
        quantity: { type: Number, required: true },
        avgBuyPrice: { type: Number, required: true }
    }],
    transactionHistory: [{
        type: { 
            type: String, 
            enum: ['BUY', 'SELL'],
            required: true 
        },
        ticker: { type: String, required: true },
        quantity: { type: Number, required: true },
        executionPrice: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        date: { type: Date, default: Date.now }
    }],
    holdings: [assetSchema],
    brokerAuths: [brokerAuthSchema]
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password, 10);
});

// 2. Method to verify password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// 3. Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, username: this.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// 4. Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

const User = mongoose.model('User', userSchema);
export default User;