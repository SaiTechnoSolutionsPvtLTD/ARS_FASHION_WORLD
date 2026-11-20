const Brand = require('../models/Brand');
const fs = require('fs');
const path = require('path');

// 1. ADD BRAND
exports.addBrand = async (req, res) => {
    try {
        const brand = await Brand.create({
            name: req.body.name,
            description: req.body.description,
            image: req.file ? req.file.filename : null 
        });
        res.status(201).json({ message: "Brand Added Successfully! ", brand });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. GET ALL BRANDS
exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.findAll();
        res.json(brands);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. GET SINGLE BRAND
exports.getSingleBrand = async (req, res) => {
    try {
        const brand = await Brand.findByPk(req.params.id);
        if (!brand) return res.status(404).json({ message: "Brand not found!" });
        res.json(brand);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. UPDATE BRAND
exports.updateBrand = async (req, res) => {
    try {
        const brand = await Brand.findByPk(req.params.id);
        if (!brand) return res.status(404).json({ message: "Brand not found!" });

        let updatedData = { ...req.body };
        if (req.file) {
           
            if (brand.image) {
                const oldPath = path.join(__dirname, '../uploads/', brand.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updatedData.image = req.file.filename;
        }

        await brand.update(updatedData);
        res.json({ message: "Brand Updated! ", brand });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. DELETE BRAND
exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByPk(req.params.id);
        if (brand && brand.image) {
            const filePath = path.join(__dirname, '../uploads/', brand.image);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await Brand.destroy({ where: { id: req.params.id } });
        res.json({ message: "Brand and Image Deleted! " });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};