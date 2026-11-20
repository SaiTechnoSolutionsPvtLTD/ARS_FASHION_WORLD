const { Product, ProductVariant, Thumbnail, Category, BestSeller, TrendingProduct, NewArrival, OrderSlot, Review, sequelize } = require('../models');
const { updateProductCollections } = require('./collectionController');
const { Op } = require('sequelize');
const fs   = require('fs');
const path = require('path');


const generateSlug = (name) => {
    return (name || 'product')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

const makeUniqueSlug = async (baseName, excludeId = null) => {
    const base = generateSlug(baseName);
    let slug = base;
    let counter = 2;
    while (true) {
        const where = { slug };
        if (excludeId) where.id = { [Op.ne]: excludeId };
        const existing = await Product.findOne({ where });
        if (!existing) return slug;
        slug = `${base}-${counter}`;
        counter++;
    }
};

/* ─── shared include array ─── */
const fullInclude = [
    { model: Category,        as: 'category',    attributes: ['id', 'name'] },
    { model: ProductVariant,  as: 'variants'     },
    { model: Thumbnail,       as: 'thumbnails',  attributes: ['id', 'image'] },
    { model: BestSeller,      as: 'bestSeller',  attributes: ['id'] },
    { model: TrendingProduct, as: 'trending',    attributes: ['id'] },
    { model: NewArrival,      as: 'newArrival',  attributes: ['id'] },
];

const formatProduct = (p) => {
    const totalStock = p.variants?.reduce((sum, v) => sum + Number(v.quantity || 0), 0) || 0;

    // Parse variant prices to Number
    const variants = (p.variants || []).map(v => ({
        ...v,
        mrpPrice:   Number(v.mrpPrice   || 0),
        salesPrice: Number(v.salesPrice || 0),
        quantity:   Number(v.quantity   || 0),
    }));

    return {
        ...p,
        // Parse product-level prices to Number
        mrpPrice:     Number(p.mrpPrice   || 0),
        salesPrice:   Number(p.salesPrice || 0),
        variants,
        totalStock,
        status:       totalStock >= 10,
        isBestSeller: !!p.bestSeller,
        isTrending:   !!p.trending,
        isNewArrival: !!p.newArrival,
    };
};


const formatSingle = (p) => {
    const base = formatProduct(p);
    return {
        ...base,
       
        slug: p.slug || generateSlug(p.name),
    };
};


// --- 1. GET ALL PRODUCTS ---
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: fullInclude,
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(products.map(p => formatProduct(p.toJSON())));
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// --- 2. GET SINGLE PRODUCT BY ID ---
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, { include: fullInclude });
        if (!product) return res.status(404).json({ message: 'Product Not Found' });
        res.status(200).json(formatSingle(product.toJSON()));
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        // First: try exact slug match (normal case)
        let product = await Product.findOne({
            where: { slug },
            include: fullInclude
        });

       
        if (!product) {
            const allProducts = await Product.findAll({
                where: { slug: null },
                include: fullInclude
            });
            product = allProducts.find(p => generateSlug(p.name) === slug) || null;
        }

        if (!product) return res.status(404).json({ message: 'Product Not Found' });

        const formatted = formatSingle(product.toJSON());

        
        if (!product.slug) {
            await product.update({ slug: formatted.slug }).catch(() => {});
        }

        res.status(200).json(formatted);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// --- 3. CREATE PRODUCT ---
exports.createProduct = async (req, res) => {
    try {
        const { name, description, categoryId, mrpPrice, salesPrice, variants,
                isBestSeller, isTrending, isNewArrival } = req.body;
        const mainImage = req.files?.mainImage ? req.files.mainImage[0].filename : null;

        const slug = await makeUniqueSlug(name);

        const product = await Product.create({
            name, slug, description, categoryId, mainImage,
            mrpPrice:   mrpPrice   || null,
            salesPrice: salesPrice || null
        });

        if (req.files?.thumbnails) {
            const thumbData = req.files.thumbnails.slice(0, 7).map(file => ({
                image: file.filename, productId: product.id
            }));
            await Thumbnail.bulkCreate(thumbData);
        }

        if (variants) {
            const finalVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
            await ProductVariant.bulkCreate(finalVariants.map(v => ({ ...v, productId: product.id })));
        }

        await updateProductCollections(product.id, { isBestSeller, isTrending, isNewArrival });

        res.status(201).json({ success: true, message: 'Product Created!', productId: product.id, slug });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// --- 4. UPDATE PRODUCT ---
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, categoryId, mrpPrice, salesPrice, variants,
                removedThumbIds, isBestSeller, isTrending, isNewArrival } = req.body;

        const product = await Product.findByPk(id, {
            include: [{ model: Thumbnail, as: 'thumbnails' }]
        });
        if (!product) return res.status(404).json({ message: 'Product Not Found' });

        let mainImage = product.mainImage;
        if (req.files?.mainImage) {
            if (product.mainImage) {
                const oldPath = path.join(__dirname, '../uploads', product.mainImage);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            mainImage = req.files.mainImage[0].filename;
        }

        let slug = product.slug;
        if (name && name !== product.name) {
            slug = await makeUniqueSlug(name, id);
        }
        if (!slug) {
            slug = await makeUniqueSlug(name || product.name, id);
        }

        await product.update({
            name, slug, description, categoryId, mainImage,
            mrpPrice:   mrpPrice   !== undefined ? mrpPrice   : product.mrpPrice,
            salesPrice: salesPrice !== undefined ? salesPrice : product.salesPrice
        });

        if (removedThumbIds) {
            const ids = typeof removedThumbIds === 'string' ? JSON.parse(removedThumbIds) : removedThumbIds;
            if (Array.isArray(ids) && ids.length > 0) {
                const toDelete = product.thumbnails.filter(t => ids.includes(t.id));
                toDelete.forEach(t => {
                    const p = path.join(__dirname, '../uploads', t.image);
                    if (fs.existsSync(p)) fs.unlinkSync(p);
                });
                await Thumbnail.destroy({ where: { id: ids, productId: id } });
            }
        }

        if (req.files?.thumbnails) {
            const currentCount = await Thumbnail.count({ where: { productId: id } });
            const canAdd = Math.max(0, 7 - currentCount);
            if (canAdd > 0) {
                const newThumbs = req.files.thumbnails.slice(0, canAdd).map(file => ({
                    image: file.filename, productId: id
                }));
                await Thumbnail.bulkCreate(newThumbs);
            }
        }

        if (variants) {
            const finalVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
            await ProductVariant.destroy({ where: { productId: id } });
            await ProductVariant.bulkCreate(finalVariants.map(v => ({
                size: v.size, color: v.color, mrpPrice: v.mrpPrice,
                salesPrice: v.salesPrice, quantity: v.quantity, productId: id
            })));
        }

        await updateProductCollections(id, { isBestSeller, isTrending, isNewArrival });

        res.status(200).json({ success: true, message: 'Product Updated Successfully!', slug });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// --- 5. GET PRODUCTS BY CATEGORY ---

exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await Product.findAll({
            where: { categoryId },
            include: fullInclude,
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(products.map(p => {
            const formatted = formatProduct(p.toJSON());
            // Ensure slug is present for similar product navigation
            return {
                ...formatted,
                slug: p.slug || generateSlug(p.name),
            };
        }));
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
};

// --- 6. DELETE PRODUCT ---
exports.deleteProduct = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [
                { model: Thumbnail, as: 'thumbnails' },
                { model: ProductVariant, as: 'variants' }
            ],
            transaction: t
        });
        if (!product) {
            await t.rollback();
            return res.status(404).json({ message: 'Product Not Found' });
        }


        const variantIds = (product.variants || []).map(v => v.id);

        const slots = await OrderSlot.findAll({
            where: {
                [Op.or]: [
                    { productId: product.id },
                    ...(variantIds.length ? [{ variantId: { [Op.in]: variantIds } }] : [])
                ]
            },
            transaction: t
        });

       
        for (const slot of slots) {
            await slot.update({
                productName:  slot.productName  || product.name      || null,
                productImage: slot.productImage || product.mainImage || null,
                productId:    null,   
                variantId:    null,   
            }, { transaction: t });
        }

    
        const reviews = await Review.findAll({ where: { productId: product.id }, transaction: t });
        for (const review of reviews) {
            if (review.orderId) await review.update({ orderId: null }, { transaction: t });
            await review.destroy({ transaction: t });
        }

        await product.destroy({ transaction: t });

        await t.commit();

     
        const safeUnlink = (filename) => {
            if (!filename) return;
            const p = path.join(__dirname, '../uploads', filename);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        };
        safeUnlink(product.mainImage);
        (product.thumbnails || []).forEach(t => safeUnlink(t.image));

        res.status(200).json({ success: true, message: 'Product Deleted Successfully!' });
    } catch (e) {
        await t.rollback();
        res.status(500).json({ success: false, error: e.message });
    }
};