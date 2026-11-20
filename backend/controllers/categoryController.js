const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Product = require('../models/Product');
const OrderSlot = require('../models/OrderSlot');
const ProductVariant = require('../models/ProductVariant');
const { Sequelize } = require('sequelize');

// 1. Add Category
exports.addCategory = async (req, res) => {
    try {
        const image = req.file ? req.file.filename : null;
        const category = await Category.create({ ...req.body, image });
        res.status(201).json(category);
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

// 2. Get All Categories 
exports.getAllCategories = async (req, res) => {
    try {
        const cats = await Category.findAll({
            attributes: {
                include: [[
                    Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM products AS p
                        WHERE p.categoryId = Category.id
                    )`),
                    'productCount' 
                ]]
            },
            order: [['createdAt', 'DESC']] 
        });
        res.json(cats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Get Single Category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const cat = await Category.findByPk(req.params.id, {
            attributes: {
                include: [[
                    Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM products AS p
                        WHERE p.categoryId = Category.id
                    )`),
                    'productCount'
                ]]
            }
        });
        if (!cat) return res.status(404).json({ message: "Category not found" });
        res.json(cat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Update Category
exports.updateCategory = async (req, res) => {
    try {
        const cat = await Category.findByPk(req.params.id);
        if (!cat) return res.status(404).json({ message: "Category not found" });
        let updatedData = { ...req.body };
        if (req.file) updatedData.image = req.file.filename;
        await cat.update(updatedData);
        res.json({ message: "Category updated successfully", cat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deleteCategory = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const cat = await Category.findByPk(req.params.id, { transaction: t });
        if (!cat) {
            await t.rollback();
            return res.status(404).json({ message: 'Category not found' });
        }

      
        const products = await Product.findAll({
            where: { categoryId: cat.id },
            include: [{ model: ProductVariant, as: 'variants' }],
            transaction: t
        });

        if (products.length > 0) {
            const productIds = products.map(p => p.id);

            
            const variantIds = products.flatMap(p => (p.variants || []).map(v => v.id));

           
            const slots = await OrderSlot.findAll({
                where: {
                    [Op.or]: [
                        { productId: { [Op.in]: productIds } },
                        ...(variantIds.length ? [{ variantId: { [Op.in]: variantIds } }] : [])
                    ]
                },
                transaction: t
            });

           
            for (const slot of slots) {
                const product = products.find(p => p.id === slot.productId);
                await slot.update({
                    productName:  slot.productName  || (product ? product.name      : null) || null,
                    productImage: slot.productImage || (product ? product.mainImage : null) || null,
                    productId:    null,  
                    variantId:    null,  
                }, { transaction: t });
            }

           
            const allReviews = await Review.findAll({
                where: { productId: { [Op.in]: productIds } },
                transaction: t
            });
            for (const review of allReviews) {
                if (review.orderId) await review.update({ orderId: null }, { transaction: t });
                await review.destroy({ transaction: t });
            }
        }

       
        await t.commit();

       
        await cat.destroy();

        // Delete category image file from disk
        if (cat.image) {
            const imgPath = path.join(__dirname, '../uploads', cat.image);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        res.json({
            message: 'Category and its products deleted successfully. Order history is preserved.',
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};