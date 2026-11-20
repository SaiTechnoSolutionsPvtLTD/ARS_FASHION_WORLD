const { Wishlist, Product, ProductVariant, Thumbnail, Category } = require('../models/index');

const productInclude = [
    { model: Product, as: 'product', include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: ProductVariant, as: 'variants' },
        { model: Thumbnail, as: 'thumbnails', attributes: ['id', 'image'] }
    ]}
];

// GET wishlist for customer
exports.getWishlist = async (req, res) => {
    try {
        const items = await Wishlist.findAll({
            where: { customerId: req.params.customerId },
            include: productInclude,
            order: [['createdAt', 'DESC']]
        });
        res.json(items);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// TOGGLE: add if not exists, remove if exists
exports.toggleWishlist = async (req, res) => {
    try {
        const { customerId, productId } = req.body;
        const existing = await Wishlist.findOne({ where: { customerId, productId } });
        if (existing) {
            await existing.destroy();
            return res.json({ message: 'Removed from wishlist', action: 'removed' });
        }
        const item = await Wishlist.create({ customerId, productId });
        res.status(201).json({ message: 'Added to wishlist', action: 'added', item });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// REMOVE single
exports.removeFromWishlist = async (req, res) => {
    try {
        const deleted = await Wishlist.destroy({ where: { id: req.params.id } });
        if (deleted) res.json({ message: 'Removed' });
        else res.status(404).json({ message: 'Not found' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// CHECK if product is in wishlist
exports.checkWishlist = async (req, res) => {
    try {
        const { customerId, productId } = req.params;
        const item = await Wishlist.findOne({ where: { customerId, productId } });
        res.json({ inWishlist: !!item });
    } catch (e) { res.status(500).json({ error: e.message }); }
};