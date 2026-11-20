const { Op } = require('sequelize');
const Deal = require('../models/Deal');


const deleteExpiredDeals = async () => {
    try {
        const deleted = await Deal.destroy({
            where: {
                expiryDate: { [Op.lt]: new Date() }  
            }
        });
        if (deleted > 0) {
            console.log(`[Deal Cleanup] ${deleted} expired deal(s) auto-deleted.`);
        }
    } catch (err) {
        console.error('[Deal Cleanup Error]', err.message);
    }
};

// GET: /api/deals/active
exports.getActiveDeal = async (req, res) => {
    try {
       
        await deleteExpiredDeals();

        const deal = await Deal.findOne({
            where: { 
                isActive: true,
                expiryDate: { [Op.gt]: new Date() }
            },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(deal || null);
    } catch (err) {
        res.status(500).json({ message: "Error fetching deal", error: err.message });
    }
};

// POST: /api/deals/add
exports.addDeal = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded. Please select a banner image." });
        }

        const { title, description, expiryDate, buttonText, buttonLink } = req.body;

        await deleteExpiredDeals();

        await Deal.update({ isActive: false }, { where: { isActive: true } });

        const newDeal = await Deal.create({
            title,
            description,
            expiryDate,
            buttonText: buttonText || "SHOP NOW",
            buttonLink: buttonLink || "/shop",
            image: req.file.filename, 
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: "New Deal of the Day activated successfully!",
            data: newDeal
        });
    } catch (err) {
        console.error("Add Deal Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// DELETE: /api/deals/:id
exports.deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;
        await Deal.destroy({ where: { id } });
        res.status(200).json({ message: "Deal removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT: /api/deals/update/:id
exports.updateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, expiryDate, buttonText, buttonLink } = req.body;

        const deal = await Deal.findByPk(id); 
        if (!deal) return res.status(404).json({ message: "Deal not found" });

        deal.title = title || deal.title;
        deal.description = description || deal.description;
        deal.expiryDate = expiryDate || deal.expiryDate;
        deal.buttonText = buttonText || deal.buttonText;
        deal.buttonLink = buttonLink || deal.buttonLink;

        if (req.file) deal.image = req.file.filename;

        await deal.save();

        res.status(200).json({
            success: true,
            message: "Deal updated successfully!",
            data: deal
        });
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
};


exports.deleteExpiredDeals = deleteExpiredDeals;
