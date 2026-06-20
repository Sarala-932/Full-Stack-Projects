import investmentModel from "../models/investmentModel.mjs";
import userModel from "../models/userModel.mjs";

// Helper to fetch live prices if symbol is provided
const fetchLivePrice = async (symbol, assetType) => {
    try {
        const isNumeric = /^\d+$/.test(symbol);

        if (assetType === "STOCK" || assetType === "CRYPTO" || (assetType === "MUTUAL_FUND" && !isNumeric)) {
            // Use Yahoo Finance Chart API
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
            if (response.ok) {
                const data = await response.json();
                if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
                    return data.chart.result[0].meta.regularMarketPrice;
                }
            }
        } else if (assetType === "MUTUAL_FUND" && isNumeric) {
            // Use mfapi.in
            const response = await fetch(`https://api.mfapi.in/mf/${symbol}`);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    return parseFloat(data.data[0].nav);
                }
            }
        }
    } catch (error) {
        console.error(`Failed to fetch live price for ${symbol}:`, error);
    }
    return null;
};

export const getLivePrice = async (req, res) => {
    try {
        const { symbol, type } = req.query;
        if (!symbol || !type) {
            return res.status(400).json({ success: false, message: "Symbol and type are required" });
        }
        
        const price = await fetchLivePrice(symbol, type);
        if (price !== null) {
            return res.status(200).json({ success: true, price });
        } else {
            return res.status(404).json({ success: false, message: "Price not found" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const addInvestment = async (req, res) => {
    try {
        const user = req.user;
        const data = req.body;

        // Check if investment already exists

        const query = {userId: user._id};
        if (data.symbol && data.symbol.trim() !== "") {
            query.$or = [{symbol: data.symbol}, {assetName: data.assetName}];
        } else {
            query.assetName = data.assetName;
        }

        const existingInvestment = await investmentModel.findOne(query).lean();
        if (existingInvestment) {
            return res.status(400).json({
                success: false,
                message: "This asset already exists in your portfolio. Please edit the existing one instead.",
            });
        }

        // If symbol is provided and currentPrice is not set or 0, try to fetch it

        let currentPrice = data.currentPrice;
        if (data.symbol && (!currentPrice || currentPrice === 0)) {
            const livePrice = await fetchLivePrice(data.symbol, data.assetType);
            if (livePrice !== null) {
                currentPrice = livePrice;
            }
        }

        const investment = await investmentModel.create({
            ...data,
            currentPrice: currentPrice || data.purchasePrice, // fallback to purchase price
            userId: user._id,
        });

        return res
            .status(201)
            .json({success: true, data: investment, message: "Investment added successfully"});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
};

export const getInvestments = async (req, res) => {
    try {
        const user = req.user;

        const investments = await investmentModel.find({userId: user._id}).sort({createdAt: -1}).lean();

        return res.status(200).json({
            success: true,
            data: investments,
            message: "Investments fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
};

export const updateInvestment = async (req, res) => {
    try {
        const user = req.user;
        const {id} = req.params;
        const updateData = req.body;

        const investment = await investmentModel.findOneAndUpdate(
            {_id: id, userId: user._id},
            {$set: updateData},
            {new: true},
        );

        if (!investment) {
            return res.status(404).json({success: false, message: "Investment not found"});
        }

        return res.status(200).json({
            success: true,
            data: investment,
            message: "Investment updated successfully",
        });
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
};

export const deleteInvestment = async (req, res) => {
    try {
        const user = req.user;

        const {id} = req.params;

        const investment = await investmentModel.findOneAndDelete({_id: id, userId: user._id});

        if (!investment) {
            return res.status(404).json({success: false, message: "Investment not found"});
        }

        return res.status(200).json({
            success: true,
            message: "Investment deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
};

export const syncLivePrices = async (req, res) => {
    try {
        const user = req.user;

        const investments = await investmentModel.find({
            userId: user._id,
            symbol: {$exists: true, $ne: ""},
            assetType: {$in: ["STOCK", "CRYPTO", "MUTUAL_FUND"]},
        });

        const updates = [];
        const updatedDetails = [];

        for (const inv of investments) {
            const livePrice = await fetchLivePrice(inv.symbol, inv.assetType);
            if (livePrice !== null && livePrice !== inv.currentPrice) {
                updatedDetails.push({
                    assetName: inv.assetName,
                    symbol: inv.symbol,
                    oldPrice: inv.currentPrice,
                    newPrice: livePrice
                });
                
                inv.currentPrice = livePrice;
                updates.push(inv.save());
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
        }

        return res.status(200).json({
            success: true,
            message: `Synced ${updates.length} investments successfully`,
            data: updatedDetails
        });
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
};

export const searchInvestments = async (req, res) => {
    try {
        const { q, type } = req.query;
        if (!q) {
            return res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
        }

        let results = [];

        if (type === "MUTUAL_FUND") {
            const response = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(q)}`);
            if (response.ok) {
                const data = await response.json();
                results = (data || []).slice(0, 100).map(fund => ({
                    symbol: fund.schemeCode.toString(),
                    name: fund.schemeName,
                    exchange: "MFAPI",
                    type: "MUTUALFUND"
                }));
            }
        } else {
            // Default to Yahoo Finance for STOCK, CRYPTO, etc.
            const response = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`);
            if (response.ok) {
                const data = await response.json();
                results = (data.quotes || []).map(quote => ({
                    symbol: quote.symbol,
                    name: quote.shortname || quote.longname || quote.symbol,
                    exchange: quote.exchange,
                    type: quote.quoteType
                }));
            }
        }

        return res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
