const { BestSeller, TrendingProduct, NewArrival, Product, Category, ProductVariant, Thumbnail } = require('../models');

const productInclude = [
    { model: Category, as: 'category', attributes: ['id', 'name'] },
    { model: ProductVariant, as: 'variants' },
    { model: Thumbnail, as: 'thumbnails', attributes: ['id', 'image'] }
];

// ── GET ALL THREE COLLECTIONS ──
exports.getAllCollections = async (req, res) => {
    try {
        const [bestSellers, trending, newArrivals] = await Promise.all([
            BestSeller.findAll({ include: [{ model: Product, as: 'product', include: productInclude }], order: [['addedAt', 'DESC']] }),
            TrendingProduct.findAll({ include: [{ model: Product, as: 'product', include: productInclude }], order: [['addedAt', 'DESC']] }),
            NewArrival.findAll({ include: [{ model: Product, as: 'product', include: productInclude }], order: [['addedAt', 'DESC']] })
        ]);
        res.json({ bestSellers, trending, newArrivals });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// ── GET BEST SELLERS ──
exports.getBestSellers = async (req, res) => {
    try {
        const data = await BestSeller.findAll({
            include: [{ model: Product, as: 'product', include: productInclude }],
            order: [['addedAt', 'DESC']]
        });
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// ── GET TRENDING ──
exports.getTrending = async (req, res) => {
    try {
        const data = await TrendingProduct.findAll({
            include: [{ model: Product, as: 'product', include: productInclude }],
            order: [['addedAt', 'DESC']]
        });
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// ── GET NEW ARRIVALS ──
exports.getNewArrivals = async (req, res) => {
    try {
        const data = await NewArrival.findAll({
            include: [{ model: Product, as: 'product', include: productInclude }],
            order: [['addedAt', 'DESC']]
        });
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// ── UPDATE COLLECTIONS FOR A PRODUCT ──

exports.updateProductCollections = async (productId, { isBestSeller, isTrending, isNewArrival }) => {
    // BestSeller
    if (isBestSeller === true || isBestSeller === 'true') {
        await BestSeller.findOrCreate({ where: { productId } });
    } else {
        await BestSeller.destroy({ where: { productId } });
    }

    // Trending
    if (isTrending === true || isTrending === 'true') {
        await TrendingProduct.findOrCreate({ where: { productId } });
    } else {
        await TrendingProduct.destroy({ where: { productId } });
    }

    // New Arrival
    if (isNewArrival === true || isNewArrival === 'true') {
        await NewArrival.findOrCreate({ where: { productId } });
    } else {
        await NewArrival.destroy({ where: { productId } });
    }
};

// ── REMOVE FROM COLLECTION (Admin manual remove) 
exports.removeFromBestSeller = async (req, res) => {
    try {
        await BestSeller.destroy({ where: { productId: req.params.productId } });
        res.json({ success: true, message: 'Removed from Best Sellers' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.removeFromTrending = async (req, res) => {
    try {
        await TrendingProduct.destroy({ where: { productId: req.params.productId } });
        res.json({ success: true, message: 'Removed from Trending' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.removeFromNewArrival = async (req, res) => {
    try {
        await NewArrival.destroy({ where: { productId: req.params.productId } });
        res.json({ success: true, message: 'Removed from New Arrivals' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};
