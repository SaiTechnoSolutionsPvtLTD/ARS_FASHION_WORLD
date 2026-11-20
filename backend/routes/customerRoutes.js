
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Registration OTP flow
router.post('/send-register-otp',     customerController.sendRegisterOtp);
router.post('/resend-register-otp',   customerController.resendRegisterOtp);
router.post('/verify-register-otp',   customerController.verifyRegisterOtp);
router.post('/register',              customerController.registerCustomer);
router.post('/login',                 customerController.loginCustomer);
router.get('/all',                    customerController.getAllCustomers);


// Customer CRUD
router.get('/:id',                    customerController.getSingleCustomer);
router.put('/update/:id',             customerController.updateCustomer);
router.delete('/delete/:id',          customerController.deleteCustomer);

// Legacy Customer (primary/registered) Address update
router.put('/address/update/:id',     customerController.updateCustomerAddress);

// Shipping Address (used during orders)
router.post('/add-shipping',          customerController.addShippingAddress);
router.delete('/shipping/:id',        customerController.deleteShippingAddress);
router.put('/shipping/update/:id',    customerController.updateShippingAddress);

// Settings
router.put('/settings/:id',           customerController.saveSettings);

// Password (OTP flow)
router.post('/forgot-password',       customerController.forgotPassword);
router.post('/verify-otp',            customerController.verifyOtp);
router.post('/reset-password',        customerController.resetPassword);

// Delivery review mail
router.post('/send-review-mail/:orderId', customerController.sendDeliveryReviewMail);

module.exports = router;