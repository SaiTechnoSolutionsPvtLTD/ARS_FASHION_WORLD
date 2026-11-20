const Coupon = require('../models/Coupon');
const { Op, literal } = require('sequelize');

// 1. CREATE COUPON
exports.createCoupon = async (req, res) => {
    try {
        const { code, startDate, endDate, minOrderAmount, maxOrderAmount } = req.body;
        if (code) req.body.code = code.toUpperCase();

        if (new Date(startDate) > new Date(endDate))
            return res.status(400).json({ error: 'Start date cannot be later than end date' });

        if (maxOrderAmount && parseFloat(maxOrderAmount) > 0) {
            if (parseFloat(minOrderAmount) > parseFloat(maxOrderAmount))
                return res.status(400).json({ error: 'Min order amount cannot be greater than max order amount' });
        }

        const coupon = await Coupon.create(req.body);
        res.status(201).json({ message: 'Coupon Created Successfully! ', coupon });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError')
            return res.status(400).json({ error: 'This coupon code already exists!' });
        res.status(500).json({ error: error.message });
    }
};

// 2. VALIDATE COUPON (Checkout)
exports.validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const currentDate = new Date();

        if (!code || !orderAmount)
            return res.status(400).json({ message: 'Coupon code and order amount are required' });

        const coupon = await Coupon.findOne({
            where: {
                code:      code.toUpperCase(),
                status:    true,
                startDate: { [Op.lte]: currentDate },
                endDate:   { [Op.gte]: currentDate }
            }
        });

        if (!coupon)
            return res.status(404).json({ message: 'Invalid or Expired Coupon! ' });

        //  Usage limit check
        if (coupon.usedCount >= coupon.usageLimit)
            return res.status(400).json({ message: `Coupon usage limit reached! (${coupon.usedCount}/${coupon.usageLimit})` });

        const minAmount     = parseFloat(coupon.minOrderAmount) || 0;
        const maxAmount     = coupon.maxOrderAmount ? parseFloat(coupon.maxOrderAmount) : null;
        const currentAmount = parseFloat(orderAmount);

        if (currentAmount < minAmount)
            return res.status(400).json({
                message: `Minimum order of ₹${minAmount} required. Add ₹${(minAmount - currentAmount).toFixed(2)} more!`
            });

        if (maxAmount !== null && currentAmount > maxAmount)
            return res.status(400).json({
                message: `This coupon is valid only for orders up to ₹${maxAmount}`
            });

        // Calculate discount
        let discount = 0;
        const val = parseFloat(coupon.discountValue);

        if (coupon.type === 'percentage') {
            discount = (currentAmount * val) / 100;
            const max = parseFloat(coupon.maxDiscount);
            if (max && discount > max) discount = max;
        } else {
            discount = val;
        }

        if (discount > currentAmount) discount = currentAmount;
        const roundedDiscount = Math.round(discount);

        res.json({
            success: true,
            message: `Coupon Applied! You saved ₹${roundedDiscount.toLocaleString('en-IN')} `,
            data: {
                couponId:       coupon.id,
                code:           coupon.code,
                discountAmount: roundedDiscount,
                finalAmount:    Math.round(currentAmount - roundedDiscount),
                usageLeft:      coupon.usageLimit - coupon.usedCount 
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. GET VISIBLE COUPONS (Checkout suggestions)
exports.getVisibleCoupons = async (req, res) => {
    try {
        const { orderAmount } = req.query;
        const currentDate = new Date();

        if (!orderAmount)
            return res.status(400).json({ error: 'Order amount is required' });

        const amount = parseFloat(orderAmount);

        const coupons = await Coupon.findAll({
            where: {
                status:    true,
                startDate: { [Op.lte]: currentDate },
                endDate:   { [Op.gte]: currentDate },
                minOrderAmount: { [Op.lte]: amount },
                [Op.or]: [
                    { maxOrderAmount: null },
                    { maxOrderAmount: { [Op.gte]: amount } }
                ],
                [Op.and]: [
                    literal('`Coupon`.`usedCount` < `Coupon`.`usageLimit`') 
                ]
            },
            order: [['minOrderAmount', 'DESC']],
            attributes: [
                'id', 'code', 'description', 'type',
                'discountValue', 'minOrderAmount', 'maxOrderAmount',
                'maxDiscount', 'endDate', 'usedCount', 'usageLimit' 
            ]
        });

        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. TOGGLE STATUS
exports.toggleStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

        coupon.status = !coupon.status;
        await coupon.save();
        res.json({ message: `Coupon is now ${coupon.status ? 'Active' : 'Inactive'}`, status: coupon.status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. INCREMENT USAGE — internal function 
exports.incrementUsage = async (couponId) => {
    try {
        const coupon = await Coupon.findByPk(couponId);
        if (!coupon) return;

        if (coupon.usedCount < coupon.usageLimit) {
            await coupon.increment('usedCount', { by: 1 });
            await coupon.reload();

            //  Auto-disable when limit reached
            if (coupon.usedCount >= coupon.usageLimit) {
                await coupon.update({ status: false });
                console.log(`Coupon ${coupon.code} auto-disabled — limit reached`);
            }
        }
    } catch (error) {
        console.error('Coupon Increment Error:', error.message);
    }
};

// 6. GET ALL COUPONS (Admin)
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. DELETE COUPON
exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Coupon deleted successfully! ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};