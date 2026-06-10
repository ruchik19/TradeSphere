import axios from 'axios';
import User from '../models/user.js';


const AI_SERVER_URL = process.env.AI_SERVER_URL;

//AI CHATBOT BRIDGE

export const askChatbot = async (req,res) => {
    try{
        const {message} = req.body;
        if(!message) return res.status(400).json({error: "Message is required."});

        const response = await axios.post(`${AI_SERVER_URL}/api/chat`,{
            user_message:message
        });

        res.status(200).json({success:true, reply: response.data.reply});
    }
    catch(error){
        console.error("AI Chatbot Error:", error.message);
        res.status(500).json({error: "AI Assistant is currently offline."});
    }
};

//PORTFOLIO HEALTH ANALYZER BRIDGE

export const analyzePortfolio = async (req,res) => {
    try{
        const user = await User.findById(req.user._id);

        if(!user.holdings || user.holdings.length === 0){
            return res.status(400).json({error: "Portfolio is empty. Add assets to analyze."});
        }

        const formattedHoldings = user.holdings.map(asset => ({
            ticker: asset.ticker,
            sector: asset.sector,
            value: asset.quantity * asset.avgBuyPrice
        }));

        const response = await axios.post(`${AI_SERVER_URL}/api/portfolio/analyze`,{
            holdings: formattedHoldings
        });

        res.status(200).json({success:true, analysis: response.data});
    }
    catch(error){
        console.error("AI Portfolio Analyzer Error:",error.message);
        res.status(500).json({error: "Could not generate portfolio analysis."});
    }
};

//FINANCE JARGON SIMPLIFIER BRIDGE

export const simplifyJargon = async (req,res) => {
    try{
        const {term} = req.body;
        if(!item) return res.status(400).json({error: "A term or text is required."});

        const response = await axios.post(`${AI_SERVER_URL}/api/ai/simplify`,{
            term_or_text:term
        });
        res.status(200).json({success: true, explanation: response.data});
    }
    catch(error){
        console.error("AI Simplifier Error",error.message);
        res.status(500).json({error:"Could not simplify the term at this time."});
    }
};