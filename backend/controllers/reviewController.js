const { Review, Customer, OrderSlot, Product } = require('../models/index');

// 1. Get All Reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: Customer, as: 'customerInfo', attributes: ['name', 'email'] },
                { model: Product,  as: 'productInfo',  attributes: ['id', 'name', 'mainImage'], required: false }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(reviews);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. Get Particular Review
exports.getParticularReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id, {
            include: [
                { model: Customer, as: 'customerInfo', attributes: ['name'] },
                { model: Product,  as: 'productInfo',  attributes: ['id', 'name', 'mainImage'], required: false }
            ]
        });
        if (!review) return res.status(404).json({ error: 'Feedback not found' });
        res.json(review);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Get Published Reviews for a Specific Product
exports.getPublishedReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.findAll({
            where: { productId, status: 'published' },
            include: [{ model: Customer, as: 'customerInfo', attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(reviews);
    } catch (err) { res.status(500).json({ error: err.message }); }
};


exports.createFeedback = async (req, res) => {
    try {
        const { customerId, orderId, productId, feedback, rating } = req.body;

        // ── Validate required fields ──
        if (!customerId || !feedback)
            return res.status(400).json({ error: 'customerId and feedback are required' });
        if (!orderId)
            return res.status(400).json({ error: 'orderId is required to submit a review' });

        // ── Application-level duplicate check ──
        const existing = await Review.findOne({ where: { orderId, customerId } });
        if (existing)
            return res.status(409).json({ message: 'You have already reviewed this order' });

        // ── Resolve productId from OrderSlot if not sent ──
        let resolvedProductId = productId || null;
        if (!resolvedProductId) {
            const orderItem = await OrderSlot.findOne({ where: { orderId } });
            if (orderItem?.productId) resolvedProductId = orderItem.productId;
        }

        const newReview = await Review.create({
            customerId,
            orderId,                        
            productId: resolvedProductId,  
            feedback,
            rating:    rating || 5,
            status:    'pending'
        });

        res.status(201).json(newReview);

    } catch (err) {
       
        if (err.name === 'SequelizeUniqueConstraintError')
            return res.status(409).json({ message: 'You have already reviewed this order' });
        console.error('createFeedback error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// 5. Update Feedback — Admin approves/rejects or edits
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, feedback } = req.body;

        const review = await Review.findByPk(id);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        await review.update({ status, feedback });
        res.status(200).json({ message: 'Updated successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 6. Delete Feedback
exports.deleteReview = async (req, res) => {
    try {
        await Review.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};