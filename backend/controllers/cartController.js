const { Cart, Product, ProductVariant, Thumbnail, Category } = require('../models/index');

const productInclude = [
    { model: Product, as: 'product', include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: ProductVariant, as: 'variants' },
        { model: Thumbnail, as: 'thumbnails', attributes: ['id', 'image'] }
    ]}
];

// GET cart for logged-in customer
exports.getCart = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const items = await Cart.findAll({
            where: { customerId },
            include: productInclude,
            order: [['createdAt', 'DESC']]
        });
        res.json(items);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// ADD item to cart
exports.addToCart = async (req, res) => {
    try {
        const { customerId, productId, variantId, quantity, salesPrice } = req.body;

        const existing = await Cart.findOne({ where: { customerId, productId, variantId: variantId || null } });

        if (existing) {
            existing.quantity += (quantity || 1);
            await existing.save();
            return res.json({ message: 'Quantity updated', item: existing });
        }

        const item = await Cart.create({ customerId, productId, variantId: variantId || null, quantity: quantity || 1, salesPrice });
        res.status(201).json({ message: 'Added to cart', item });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// UPDATE quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const item = await Cart.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Cart item not found' });
        if (quantity <= 0) {
            await item.destroy();
            return res.json({ message: 'Item removed' });
        }
        item.quantity = quantity;
        await item.save();
        res.json({ message: 'Updated', item });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// REMOVE single item
exports.removeFromCart = async (req, res) => {
    try {
        const deleted = await Cart.destroy({ where: { id: req.params.id } });
        if (deleted) res.json({ message: 'Removed from cart' });
        else res.status(404).json({ message: 'Item not found' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// CLEAR entire cart for customer
exports.clearCart = async (req, res) => {
    try {
        await Cart.destroy({ where: { customerId: req.params.customerId } });
        res.json({ message: 'Cart cleared' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};