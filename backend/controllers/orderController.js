// FILE PATH: ars-fashion-backend/controllers/orderController.js
// ACTION   : REPLACE FULL FILE (added shippingAmount in placeOrder + getOrdersByCustomer)

const { Order, OrderSlot, Customer, CustomerAddress, ShippingAddress, Product, ProductVariant, Coupon, Review } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const couponController = require('./couponController');

// 1. PLACE ORDER
exports.placeOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            customerId, totalAmount, discountAmount, couponId,
            paymentMethod, paymentId, razorpayOrderId,
            items, shippingAddressId,
            shippingAmount   // ← NEW: state-wise shipping charge from frontend
        } = req.body;

        if (!customerId)                  return res.status(400).json({ error: 'customerId is required' });
        if (!totalAmount)                 return res.status(400).json({ error: 'totalAmount is required' });
        if (!items || items.length === 0) return res.status(400).json({ error: 'Order must have at least one item' });

        const customId = `ARS-${Date.now()}`;

        let snapName = null, snapPhone = null, snapAddressLine = null;
        let snapCity = null, snapDistrict = null, snapState = null, snapPincode = null;

        if (shippingAddressId) {
            const addr = await ShippingAddress.findByPk(shippingAddressId, { transaction: t });
            if (addr) {
                snapName        = addr.name        || null;
                snapPhone       = addr.phone       || null;
                snapAddressLine = addr.addressLine || null;
                snapCity        = addr.city        || null;
                snapDistrict    = addr.district    || null;
                snapState       = addr.state       || null;
                snapPincode     = addr.pincode     || null;
            }
        }

        await Order.create({
            orderId:           customId,
            customerId,
            totalAmount,
            discountAmount:    discountAmount  || 0,
            shippingAmount:    shippingAmount  || 0,   // ← NEW
            couponId:          couponId        || null,
            paymentMethod:     paymentMethod   || 'Online',
            paymentId:         paymentId       || null,
            razorpayOrderId:   razorpayOrderId || null,
            orderStatus:       'Pending',
            paymentStatus:     'Paid',
            shippingAddressId: shippingAddressId || null,
            snapName,
            snapPhone,
            snapAddressLine,
            snapCity,
            snapDistrict,
            snapState,
            snapPincode,
        }, { transaction: t });

        const itemsWithSnapshot = await Promise.all(items.map(async (item) => {
            const salesPrice = parseFloat(item.salesPrice);
            if (isNaN(salesPrice) || salesPrice <= 0)
                throw new Error(`Invalid salesPrice "${item.salesPrice}" for productId ${item.productId}`);

            const quantity = parseInt(item.quantity);
            if (isNaN(quantity) || quantity <= 0)
                throw new Error(`Invalid quantity "${item.quantity}" for productId ${item.productId}`);

            let productName  = item.productName  || null;
            let productImage = item.productImage || null;
            let variantLabel = item.variantLabel || null;

            if (!productName && item.productId) {
                const product = await Product.findByPk(item.productId, {
                    attributes: ['name', 'mainImage'],
                    transaction: t
                });
                if (product) {
                    productName  = product.name;
                    productImage = product.mainImage;
                }
            }

            if (!variantLabel && item.variantId) {
                const variant = await ProductVariant.findByPk(item.variantId, { transaction: t });
                if (variant) {
                    const parts = [variant.size, variant.color].filter(Boolean);
                    variantLabel = parts.length > 0 ? parts.join(' / ') : null;
                }
            }

            return {
                orderId:      customId,
                productId:    item.productId || null,
                variantId:    item.variantId || null,
                salesPrice,
                quantity,
                productName,
                productImage,
                variantLabel
            };
        }));

        await OrderSlot.bulkCreate(itemsWithSnapshot, { transaction: t });
        await t.commit();

        if (couponId) {
            await couponController.incrementUsage(couponId);
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order: { id: customId, orderId: customId }
        });

    } catch (err) {
        await t.rollback();
        console.error('Order Placement Error:', err.message);
        if (err.errors) err.errors.forEach(e => console.error('  Validation:', e.path, e.message));
        res.status(500).json({
            error:   err.message,
            details: err.errors?.map(e => ({ field: e.path, message: e.message })) || []
        });
    }
};


const resolveShipping = (order) => {
    if (order.snapAddressLine || order.snapCity) {
        return {
            name:        order.snapName        || order.Customer?.name || 'Guest',
            phone:       order.snapPhone       || order.Customer?.phone || null,
            addressLine: order.snapAddressLine || null,
            city:        order.snapCity        || null,
            district:    order.snapDistrict    || null,
            state:       order.snapState       || null,
            pincode:     order.snapPincode     || null,
        };
    }
    const s = order.orderShipping;
    if (s) {
        return {
            name:        s.name        || order.Customer?.name || 'Guest',
            phone:       s.phone       || order.Customer?.phone || null,
            addressLine: s.addressLine || null,
            city:        s.city        || null,
            district:    s.district    || null,
            state:       s.state       || null,
            pincode:     s.pincode     || null,
        };
    }
    const addr = order.Customer?.CustomerAddresses?.[0];
    if (addr) {
        return {
            name:        order.Customer?.name  || 'Guest',
            phone:       order.Customer?.phone || null,
            addressLine: [addr.houseNo, addr.street].filter(Boolean).join(', '),
            city:        addr.city     || null,
            district:    addr.district || null,
            state:       addr.state    || null,
            pincode:     addr.pincode  || null,
        };
    }
    return null;
};

// 2. GET ALL ORDERS (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, search, page = 1, filter } = req.query;
        const limit  = 10;
        const offset = (page - 1) * limit;

        let whereCondition = {};
        if (status && status !== 'All') whereCondition.orderStatus = status;
        if (search) whereCondition.orderId = { [Op.like]: `%${search}%` };

        if (filter === 'today') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            if (status === 'Delivered') {
                whereCondition.updatedAt = { [Op.between]: [startOfDay, endOfDay] };
            } else {
                whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] };
            }
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Customer,
                    attributes: ['id', 'name', 'email', 'phone'],
                    include: [{ model: CustomerAddress, required: false }]
                },
                { model: ShippingAddress, as: 'orderShipping', required: false },
                {
                    model: OrderSlot,
                    as: 'slots',
                    required: false,
                    include: [{ model: Product, attributes: ['name', 'mainImage'], required: false }]
                },
                { model: Coupon, as: 'appliedCoupon', required: false }
            ],
            limit, offset, distinct: true,
            order: [['createdAt', 'DESC']]
        });

        const ordersWithSnap = rows.map(o => {
            const plain = o.toJSON();
            plain.shippingSnapshot = resolveShipping(o);
            return plain;
        });

        res.json({
            orders:      ordersWithSnap,
            totalPages:  Math.ceil(count / limit),
            totalOrders: count
        });

    } catch (error) {
        console.error('Fetch Orders Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// 3. GET ORDERS BY CUSTOMER
exports.getOrdersByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;

        const orders = await Order.findAll({
            where: { customerId },
            include: [
                {
                    model: OrderSlot,
                    as: 'slots',
                    required: false,
                    include: [{
                        model: Product,
                        attributes: ['name', 'mainImage'],
                        required: false
                    }]
                },
                { model: ShippingAddress, as: 'orderShipping', required: false },
                { model: Coupon, as: 'appliedCoupon', required: false }
            ],
            order: [['createdAt', 'DESC']]
        });

        const orderIds = orders.map(o => o.orderId);

        const existingReviews = await Review.findAll({
            where: {
                customerId,
                orderId: { [Op.in]: orderIds }
            },
            attributes: ['orderId']
        });

        const reviewedOrderIds = new Set(existingReviews.map(r => r.orderId));

        const formatted = orders.map(o => ({
            id:             o.orderId,
            createdAt:      o.createdAt,
            status:         o.orderStatus,
            totalAmount:    o.totalAmount,
            discountAmount: o.discountAmount  || 0,
            shippingAmount: o.shippingAmount  || 0,   // ← NEW
            paymentMethod:  o.paymentMethod,
            couponCode:     o.appliedCoupon?.code || null,
            hasReview:      reviewedOrderIds.has(o.orderId),
            shippingSnapshot: resolveShipping(o),
            items: (o.slots || []).map(slot => ({
                productId:    slot.productId,
                productName:  slot.Product?.name      || slot.productName  || `Product #${slot.productId || '?'}`,
                productImage: slot.Product?.mainImage || slot.productImage || null,
                variantLabel: slot.variantLabel || null,
                quantity:     slot.quantity,
                salesPrice:   slot.salesPrice
            }))
        }));

        res.json(formatted);

    } catch (error) {
        console.error('Customer Orders Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// 4. UPDATE ORDER STATUS (Admin)
exports.updateStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const { id } = req.params;

        const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(orderStatus))
            return res.status(400).json({ error: 'Invalid status value' });

        const updated = await Order.update({ orderStatus }, { where: { orderId: id } });
        if (!updated[0]) return res.status(404).json({ error: 'Order not found' });

        if (orderStatus === 'Delivered') {
            setImmediate(async () => {
                try {
                    const { sendDeliveryReviewMail } = require('./customerController');
                    const fakeReq = { params: { orderId: id } };
                    const fakeRes = {
                        json:   () => {},
                        status: () => ({ json: () => {} }),
                    };
                    await sendDeliveryReviewMail(fakeReq, fakeRes);
                    console.log(` Delivery mail sent for order ${id}`);
                } catch (mailErr) {
                    console.error(` Delivery mail failed for order ${id}:`, mailErr.message);
                }
            });
        }

        res.json({ success: true, message: `Order status updated to ${orderStatus}` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. DELETE ORDER
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Order.destroy({ where: { orderId: id } });
        if (deleted) res.json({ success: true, message: 'Order deleted successfully' });
        else res.status(404).json({ error: 'Order not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. DASHBOARD RECENT ORDERS
exports.getRecentOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: Customer,        attributes: ['id', 'name', 'email', 'phone'], required: false },
                { model: ShippingAddress, as: 'orderShipping',                          required: false },
                {
                    model: OrderSlot,
                    as: 'slots',
                    required: false,
                    include: [{ model: Product, attributes: ['name'], required: false }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const ordersWithSnap = orders.map(o => {
            const plain = o.toJSON();
            plain.shippingSnapshot = resolveShipping(o);
            return plain;
        });

        res.json({ orders: ordersWithSnap });
    } catch (error) {
        console.error('Recent Orders Error:', error.message, error.stack);
        res.status(500).json({ error: error.message });
    }
};