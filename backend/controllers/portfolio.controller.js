import User from '../models/user.js';

//ADD AN ASSET TO PORTFOLIO
export const addAsset = async (req,res) => {
    try{
        
        const {ticker,companyName,quantity,avgBuyPrice,sector,broker} = req.body;
        console.log("Checking Variables:", { ticker, companyName, quantity, avgBuyPrice, sector });

        if(!ticker || !companyName || !quantity || !avgBuyPrice || !sector || !broker){
            return res.status(400).json({error: "Please provide all required asset details."});
        }

        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({error: "User not found."});
        }

        user.holdings.push({
            ticker,
            companyName,
            quantity: Number(quantity),
            avgBuyPrice: Number(avgBuyPrice),
            sector,
            broker: broker || 'Manual'
        });

        await user.save();

        res.status(201).json({
            success:true,
            message: `${quantity} shares of ${ticker} added to your portfolio.`,
            holdings: user.holdings
        });

    }
    catch(error){
        console.error("Add Asset Error:",error);
        res.status(500).json({error: "Internal server error while adding asset."});
    }
};

//GET USER'S ENTIRE PORTFOLIO
export const getPortfolio = async (req,res) => {
    try{
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({error: "User not found."});
        }
        const totalInvested = user.holdings.reduce((acc,asset) => {
            return acc+(asset.quantity * asset.avgBuyPrice);
        },0);
        
        res.status(200).json({
            success:true,
            totalInvested: totalInvested,
            holdings: user.holdings
        });
    } 
    catch(error){
        console.error("Get Portfolio Error:", error);
        res.status(500).json({error: "Internal server error while fetching portfolio."});
    }
};

//REMOVE AN ASSET FROM PORTFOLIO

export const removeAsset = async (req,res) => {
    try{
        const {assetId} = req.params;

        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({error:"User not found."});
        }

        const initialLength = user.holdings.length;
        user.holdings = user.holdings.filter(asset => asset._id.toString() !== assetId);

        if(user.holdings.length === initialLength){
            return res.status(404).json({error: "Asset not found in your portfolio."});
        }

        await user.save();

        res.status(200).json({
            success:true,
            message:"Asset removed successfully.",
            holdings: user.holdings
        });
    }
    catch(error){
        console.error("Remove Asset Error:", error);
        res.status(500).json({error:"Internal server error while removing asset."});
    }
};