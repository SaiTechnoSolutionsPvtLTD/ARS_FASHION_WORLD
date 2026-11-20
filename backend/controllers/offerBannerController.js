const OfferBanner = require('../models/OfferBanner');
const fs = require('fs');
const path = require('path');

// 1. ADD
exports.addOfferBanner = async (req, res) => {
    try {
        const { title, subtitle, buttonText, link, discountTag } = req.body;
        const image = req.file ? req.file.filename : null;
        if (!image) return res.status(400).json({ message: "Image required!" });
        const ob = await OfferBanner.create({ title, subtitle, buttonText, image, link, discountTag });
        res.status(201).json({ message: "Offer Banner Added!", offerBanner: ob });
    } catch (e) {
        if (req.file) fs.unlinkSync(path.join(process.cwd(), 'uploads', req.file.filename));
        res.status(500).json({ error: e.message });
    }
};

// 2. GET ALL (Public)
exports.getOfferBanners = async (req, res) => {
    try {
        const obs = await OfferBanner.findAll({ where: { status: true }, order: [['createdAt', 'DESC']] });
        res.json(obs);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 2b. GET ALL (Admin)
exports.getAllOfferBanners = async (req, res) => {
    try {
        const obs = await OfferBanner.findAll({ order: [['createdAt', 'DESC']] });
        res.json(obs);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 3. GET SINGLE
exports.getSingleOfferBanner = async (req, res) => {
    try {
        const ob = await OfferBanner.findByPk(req.params.id);
        if (!ob) return res.status(404).json({ message: "Not found" });
        res.json(ob);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 4. UPDATE
exports.updateOfferBanner = async (req, res) => {
    try {
        const ob = await OfferBanner.findByPk(req.params.id);
        if (!ob) return res.status(404).json({ message: "Not found" });

        const { title, subtitle, buttonText, link, discountTag, status } = req.body;
        let image = ob.image;

        if (req.file) {
            const oldImgPath = path.join(process.cwd(), 'uploads', ob.image);
            if (fs.existsSync(oldImgPath)) fs.unlinkSync(oldImgPath);
            image = req.file.filename;
        }

        await ob.update({ 
            title, subtitle, buttonText, image, link, discountTag, 
            status: status === 'false' ? false : true 
        });
        res.json({ message: "Offer Banner Updated!", offerBanner: ob });
    } catch (e) {
        if (req.file) fs.unlinkSync(path.join(process.cwd(), 'uploads', req.file.filename));
        res.status(500).json({ error: e.message });
    }
};

// 5. DELETE
exports.deleteOfferBanner = async (req, res) => {
    try {
        const ob = await OfferBanner.findByPk(req.params.id);
        if (!ob) return res.status(404).json({ message: "Not found" });
        
        const imgPath = path.join(process.cwd(), 'uploads', ob.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        
        await ob.destroy();
        res.json({ message: "Offer Banner Deleted!" });
    } catch (e) { res.status(500).json({ error: e.message }); }
};