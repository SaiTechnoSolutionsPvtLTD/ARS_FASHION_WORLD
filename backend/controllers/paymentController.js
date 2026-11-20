const Razorpay = require('razorpay');
const crypto   = require('crypto');

const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});

// POST /api/payment/create-order
exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body; 

        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        });

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/payment/verify
exports.verifyPayment = (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
           
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};