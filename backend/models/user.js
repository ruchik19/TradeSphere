import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type:String,
        required: [true,'password is required'],
    },
    refreshToken: {
        type: String 
    },
    linkedBrokers: {
        type: [String],
        default: []
    },
    holdings: [assetSchema]
},{timestamps:true});

// 1. Hash the password BEFORE saving to the database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return ;
    
    this.password = await bcrypt.hash(this.password, 10);

});

// 2. Method to compare incoming password with hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// 3. Method to generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// 4. Method to generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const User = mongoose.model('User',userSchema);
export default User;