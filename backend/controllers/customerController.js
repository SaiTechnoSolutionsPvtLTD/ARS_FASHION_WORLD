const { Customer, CustomerAddress, ShippingAddress, Cart, Wishlist, Order, OrderSlot, Review } = require('../models/index');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'ars_fashion_customer_secret_2026';

// OTP Stores (in-memory)
const otpStore     = {};  // for forgot-password flow
const regOtpStore  = {};  // for registration flow

// ── Nodemailer transporter ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Verify transporter on startup ──
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mailer config error:', error.message);
  } else {
    console.log('✅ Mailer is ready to send emails');
  }
});

// ── Helper: send email ──
const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"ARS Fashion World" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true };
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

// 1. REGISTER — sends welcome message only (NO OTP)
// 1a. SEND REGISTRATION OTP — Step 1: name + email + phone → OTP sent to email
exports.sendRegisterOtp = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const nameRegex  = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!name || !nameRegex.test(name.trim()))
      return res.status(400).json({ message: 'Full name must contain only letters and spaces!' });
    if (!email || !emailRegex.test(email.trim()))
      return res.status(400).json({ message: 'Enter a valid email address!' });
    if (!phone || !phoneRegex.test(phone.trim()))
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits!' });

    const existing = await Customer.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing)
      return res.status(400).json({ message: 'Email already registered! Please login.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key  = email.trim().toLowerCase();
    regOtpStore[key] = { otp, name: name.trim(), phone: phone.trim(), expiresAt: Date.now() + 10 * 60 * 1000 };

    const mailResult = await sendMail(
      key,
      'OTP — ARS Fashion World Registration',
      `
        <div style="font-family:sans-serif;max-width:440px;margin:auto;padding:28px;border:1px solid #eee;border-radius:10px">
          <h2 style="color:#d1a309">ARS Fashion World</h2>
          <p>Hi <strong>${name.trim()}</strong>, your registration OTP is:</p>
          <h1 style="letter-spacing:10px;color:#333;font-size:36px">${otp}</h1>
          <p>⏰ Valid for <strong>10 minutes</strong> only.</p>
          <p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
        </div>
      `
    );

    if (!mailResult.success) {
      delete regOtpStore[key];
      return res.status(500).json({ message: 'Failed to send OTP. Please check your email and try again.' });
    }

    res.json({ message: 'OTP sent to your email! Valid for 10 minutes.' });
  } catch (error) {
    console.error('sendRegisterOtp error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 1b. RESEND REGISTRATION OTP
exports.resendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required!' });

    const key    = email.trim().toLowerCase();
    const record = regOtpStore[key];
    if (!record) return res.status(400).json({ message: 'Please start registration again.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    regOtpStore[key] = { ...record, otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    const mailResult = await sendMail(
      key,
      'Resend OTP — ARS Fashion World',
      `
        <div style="font-family:sans-serif;max-width:440px;margin:auto;padding:28px;border:1px solid #eee;border-radius:10px">
          <h2 style="color:#d1a309">ARS Fashion World</h2>
          <p>Hi <strong>${record.name}</strong>, your new OTP is:</p>
          <h1 style="letter-spacing:10px;color:#333;font-size:36px">${otp}</h1>
          <p>⏰ Valid for <strong>10 minutes</strong> only.</p>
        </div>
      `
    );

    if (!mailResult.success)
      return res.status(500).json({ message: 'Failed to resend OTP. Try again.' });

    res.json({ message: 'New OTP sent to your email!' });
  } catch (error) {
    console.error('resendRegisterOtp error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 1c. VERIFY REGISTRATION OTP — Step 2
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required!' });

    const key    = email.trim().toLowerCase();
    const record = regOtpStore[key];

    if (!record)
      return res.status(400).json({ message: 'OTP not found or already expired. Please start again.' });
    if (Date.now() > record.expiresAt) {
      delete regOtpStore[key];
      return res.status(400).json({ message: 'OTP expired (10 minutes). Please request a new one.' });
    }
    if (record.otp !== otp.trim())
      return res.status(400).json({ message: 'Incorrect OTP! Please check and try again.' });

    // Mark OTP as verified (keep record for final step)
    regOtpStore[key].verified = true;

    res.json({ message: 'OTP verified! Please set your password.' });
  } catch (error) {
    console.error('verifyRegisterOtp error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 1d. COMPLETE REGISTRATION — Step 3: set password → create account (NO address)
exports.registerCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailRegex    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^\d{6}$/;

    if (!email || !emailRegex.test(email.trim()))
      return res.status(400).json({ message: 'Valid email is required!' });
    if (!password || !passwordRegex.test(password))
      return res.status(400).json({ message: 'Password must be exactly 6 numbers!' });

    const key    = email.trim().toLowerCase();
    const record = regOtpStore[key];

    if (!record || !record.verified)
      return res.status(400).json({ message: 'Email OTP not verified. Please verify OTP first.' });
    if (Date.now() > record.expiresAt)  {
      delete regOtpStore[key];
      return res.status(400).json({ message: 'Session expired. Please start registration again.' });
    }

    const existing = await Customer.findOne({ where: { email: key } });
    if (existing) {
      delete regOtpStore[key];
      return res.status(400).json({ message: 'Email already registered! Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      name:     record.name,
      email:    key,
      phone:    record.phone,
      password: hashedPassword,
    });

    delete regOtpStore[key];

    // ── Welcome email ──
    sendMail(
      customer.email,
      'Welcome to ARS Fashion World! 🎉',
      `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:28px;border:1px solid #eee;border-radius:10px">
          <h2 style="color:#d1a309;margin-bottom:4px">🎉 Welcome to ARS Fashion World!</h2>
          <p>Hi <strong>${customer.name}</strong>, your account has been created successfully.</p>
          <p style="color:#555">You can now login and start shopping with us.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="font-size:12px;color:#aaa">Thank you for joining us. Happy styling! 💛</p>
        </div>
      `
    );

    const token = jwt.sign({ id: customer.id, email: customer.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'Registered Successfully! Welcome to ARS Fashion World.',
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 2. LOGIN — sends login success message only (NO OTP)
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.includes('@'))
      return res.status(400).json({ message: 'Email must contain @ symbol and be valid!' });

    const passwordRegex = /^\d{6}$/;
    if (!password || !passwordRegex.test(password))
      return res.status(400).json({ message: 'Password must be exactly 6 numbers!' });

    const customer = await Customer.findOne({
      where: { email: email.trim().toLowerCase() },
      include: [{ model: CustomerAddress }, { model: ShippingAddress }],
    });
    if (!customer)
      return res.status(404).json({ message: 'Email not registered. Please register first!' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect password!' });

    // ── Login success email ──
    sendMail(
      customer.email,
      'ARS Fashion World — Login Successful 🔑',
      `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:28px;border:1px solid #eee;border-radius:10px;background:#fff;">
          <div style="text-align:center;margin-bottom:20px;">
            <h2 style="color:#d1a309;margin:0;font-size:22px;letter-spacing:1px;">ARS Fashion World</h2>
            <p style="color:#888;font-size:12px;margin:4px 0 0;">Stay Stylish. Stay You.</p>
          </div>
          <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 20px;"/>
          <p style="font-size:16px;color:#222;margin:0 0 8px;">Hi <strong>${customer.name}</strong>,</p>
          <p style="font-size:15px;color:#444;margin:0 0 20px;">You have successfully logged in to your ARS Fashion World account.</p>
          <div style="background:#fffbf0;border-left:4px solid #d1a309;padding:14px 18px;border-radius:6px;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#7a5c00;">🛍️ Explore our latest collections and enjoy exclusive offers just for you!</p>
          </div>
          <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0 12px;"/>
          <p style="font-size:11px;color:#bbb;text-align:center;margin:0;">© ${new Date().getFullYear()} ARS Fashion World. All rights reserved.</p>
        </div>
      `
    );

    const token = jwt.sign({ id: customer.id, email: customer.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login Successful!',
      token,
      customer: {
        id:                customer.id,
        name:              customer.name,
        email:             customer.email,
        phone:             customer.phone,
        createdAt:         customer.createdAt,
        addresses:         customer.CustomerAddresses  || [],
        shippingAddresses: customer.ShippingAddresses  || [],
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 3. GET ALL
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [{ model: CustomerAddress }, { model: ShippingAddress }],
      attributes: { 
        exclude: ['password'],
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Orders
              WHERE Orders.customerId = Customer.id
            )`),
            'orderCount'
          ],
          [
            sequelize.literal(`(
              SELECT COALESCE(SUM(totalAmount), 0)
              FROM Orders
              WHERE Orders.customerId = Customer.id
            )`),
            'totalSpent'
          ],
          [
            sequelize.literal(`(
              SELECT COALESCE(MAX(totalAmount), 0)
              FROM Orders
              WHERE Orders.customerId = Customer.id
            )`),
            'highestPurchase'
          ]
        ]
      },
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. GET SINGLE
exports.getSingleCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [{ model: CustomerAddress }, { model: ShippingAddress }],
      attributes: { exclude: ['password'] },
    });
    if (!customer) return res.status(404).json({ message: 'Customer Not Found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. UPDATE PROFILE
exports.updateCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // ✅ Fixed: supports Tamil, Hindi, English, dots, hyphens, apostrophes
    const nameRegex  = /^[\p{L}\s.\-']+$/u;
    const phoneRegex = /^\d{10}$/;

    if (!name || !name.trim())
      return res.status(400).json({ message: 'Name is required!' });
    if (!nameRegex.test(name.trim()))
      return res.status(400).json({ message: 'Full name contains invalid characters!' });
    // ✅ Fixed: phone is validated only if provided (not empty)
    if (phone && phone.trim() && !phoneRegex.test(phone.trim()))
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits!' });

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const updateData = { name: name.trim() };
    if (phone && phone.trim()) updateData.phone = phone.trim();

    await customer.update(updateData);
    res.json({ message: 'Updated Successfully!', customer: { id: customer.id, name: customer.name, phone: customer.phone } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. DELETE CUSTOMER
exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;

    await Cart.destroy({ where: { customerId } });
    await Wishlist.destroy({ where: { customerId } });
    await Review.destroy({ where: { customerId } });

    const customerOrders = await Order.findAll({ where: { customerId }, attributes: ['orderId'] });
    const orderIds = customerOrders.map(o => o.orderId);
    if (orderIds.length > 0) {
      await OrderSlot.destroy({ where: { orderId: orderIds } });
      await Order.destroy({ where: { orderId: orderIds } });
    }

    await CustomerAddress.destroy({ where: { customerId } });
    await ShippingAddress.destroy({ where: { customerId } });

    const result = await Customer.destroy({ where: { id: customerId } });
    if (result) res.json({ message: 'Account deleted successfully!' });
    else res.status(404).json({ message: 'Customer not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. ADD SHIPPING ADDRESS

exports.addShippingAddress = async (req, res) => {
  try {
    const { customerId, name, phone, addressLine, city, state, pincode, district } = req.body;

    const nameRegex    = /^[a-zA-Z\s]+$/;
    const phoneRegex   = /^\d{10}$/;
    const pincodeRegex = /^\d{6}$/;

    // ── Trim all incoming strings before validation ──
    const trimmedName        = (name        || '').trim();
    const trimmedPhone       = (phone       || '').trim();
    const trimmedAddressLine = (addressLine || '').trim();
    const trimmedCity        = (city        || '').trim();
    const trimmedState       = (state       || '').trim();
    const trimmedPincode     = (pincode     || '').trim();
    const trimmedDistrict    = (district    || '').trim();

    // ── Validate ──
    if (!trimmedName || !nameRegex.test(trimmedName))
      return res.status(400).json({ message: 'Full name is required and must contain only letters and spaces!' });
    if (!trimmedPhone || !phoneRegex.test(trimmedPhone))
      return res.status(400).json({ message: 'Phone number is required and must be exactly 10 digits!' });
    if (!trimmedAddressLine)
      return res.status(400).json({ message: 'Address is required!' });
    if (!trimmedCity)
      return res.status(400).json({ message: 'City is required!' });
    if (!trimmedState)
      return res.status(400).json({ message: 'State is required!' });
    if (!trimmedPincode || !pincodeRegex.test(trimmedPincode))
      return res.status(400).json({ message: 'PIN Code is required and must be exactly 6 digits!' });

    const customer = await Customer.findByPk(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer Not Found!' });

    // ── Avoid duplicate shipping addresses ──
    const existing = await ShippingAddress.findOne({
      where: {
        customerId,
        addressLine: trimmedAddressLine,
        city:        trimmedCity,
        state:       trimmedState,
        pincode:     trimmedPincode,
      },
    });
    if (existing) {
      return res.status(200).json({ message: 'Shipping Address Already Exists!', address: existing });
    }

    // ── Create new shipping address ──
    const shipping = await ShippingAddress.create({
      customerId,
      name:        trimmedName,
      phone:       trimmedPhone,
      addressLine: trimmedAddressLine,
      city:        trimmedCity,
      state:       trimmedState,
      pincode:     trimmedPincode,
      district:    trimmedDistrict || null,
    });

    res.status(201).json({ message: 'Shipping Address Added!', address: shipping });
  } catch (error) {
    console.error('addShippingAddress error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 8. DELETE SHIPPING
exports.deleteShippingAddress = async (req, res) => {
  try {
    const deleted = await ShippingAddress.destroy({ where: { id: req.params.id } });
    if (deleted) res.json({ message: 'Shipping Address deleted!' });
    else res.status(404).json({ message: 'Address not found!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 9. UPDATE SHIPPING ADDRESS
exports.updateShippingAddress = async (req, res) => {
  try {
    const { houseNo, street, addressLine, city, state, pincode, country, name, phone, district } = req.body;
    const address = await ShippingAddress.findByPk(req.params.id);
    if (!address) return res.status(404).json({ message: 'Shipping address not found' });

    // Support both old (houseNo+street) and new (addressLine) formats
    const resolvedAddressLine = addressLine ||
      (houseNo && street ? `${houseNo}, ${street}` : address.addressLine);

    await address.update({
      addressLine: resolvedAddressLine || address.addressLine,
      city:     city     || address.city,
      state:    state    || address.state,
      pincode:  pincode  || address.pincode,
      country:  country  || address.country,
      name:     name     !== undefined ? name     : address.name,
      phone:    phone    !== undefined ? phone    : address.phone,
      district: district !== undefined ? district : address.district,
    });
    res.json({ message: 'Shipping address updated!', data: address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 9b. UPDATE CUSTOMER ADDRESS
exports.updateCustomerAddress = async (req, res) => {
  try {
    const { houseNo, street, city, state, pincode, country, district } = req.body;
    const address = await CustomerAddress.findByPk(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    await address.update({
      houseNo:  houseNo  || address.houseNo,
      street:   street   || address.street,
      city:     city     || address.city,
      state:    state    || address.state,
      pincode:  pincode  || address.pincode,
      country:  country  || address.country,
      district: district !== undefined ? district : address.district, 
    });
    res.json({ message: 'Address updated!', data: address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 10. SAVE SETTINGS
exports.saveSettings = async (req, res) => {
  try {
    const { emailNotif, smsNotif, promoOffers } = req.body;
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    await customer.update({
      emailNotif:  emailNotif  ?? customer.emailNotif,
      smsNotif:    smsNotif    ?? customer.smsNotif,
      promoOffers: promoOffers ?? customer.promoOffers,
    });
    res.json({ message: 'Settings saved!' });
  } catch (error) {
    res.json({ message: 'Settings saved!' });
  }
};

// 11. FORGOT PASSWORD — OTP email sent ONLY here
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@'))
      return res.status(400).json({ message: 'Email must contain @ symbol and be valid!' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return res.status(400).json({ message: 'Please enter a valid email address with @ symbol!' });

    const customer = await Customer.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!customer) return res.status(404).json({ message: 'Email not registered!' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = email.trim().toLowerCase();
    otpStore[key] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    const mailResult = await sendMail(
      key,
      'Password Reset OTP — ARS Fashion World',
      `
        <div style="font-family:sans-serif;max-width:440px;margin:auto;padding:28px;border:1px solid #eee;border-radius:10px">
          <h2 style="color:#d1a309">ARS Fashion World</h2>
          <p>Hi <strong>${customer.name}</strong>,</p>
          <p>Your OTP to reset your password is:</p>
          <h1 style="letter-spacing:10px;color:#333;font-size:36px">${otp}</h1>
          <p>⏰ This OTP is valid for <strong>10 minutes only</strong>.</p>
          <p style="color:#999;font-size:12px">If you didn't request this, please ignore this email.</p>
        </div>
      `
    );

    if (!mailResult.success) {
      delete otpStore[key];
      return res.status(500).json({
        message: 'Failed to send OTP email. Please check your email address or try again later.',
        error: mailResult.error,
      });
    }

    res.json({ message: 'OTP sent to your email! Valid for 10 minutes.' });
  } catch (error) {
    console.error('forgotPassword error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 12. VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required!' });

    const key = email.trim().toLowerCase();
    const record = otpStore[key];

    if (!record)
      return res.status(400).json({ message: 'OTP not requested or already expired!' });
    if (Date.now() > record.expiresAt) {
      delete otpStore[key];
      return res.status(400).json({ message: 'OTP has expired (valid for 10 minutes). Please request a new one.' });
    }
    if (record.otp !== otp.trim())
      return res.status(400).json({ message: 'Invalid OTP! Please check and try again.' });

    res.json({ message: 'OTP verified successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 13. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: 'Email, OTP and new password are required!' });

    const key = email.trim().toLowerCase();
    const record = otpStore[key];

    if (!record || record.otp !== otp.trim())
      return res.status(400).json({ message: 'Invalid or expired OTP!' });
    if (Date.now() > record.expiresAt) {
      delete otpStore[key];
      return res.status(400).json({ message: 'OTP expired (valid for 10 minutes). Request a new one.' });
    }

    const passwordRegex = /^\d{6}$/;
    if (!passwordRegex.test(newPassword))
      return res.status(400).json({ message: 'New password must be exactly 6 numbers!' });

    const customer = await Customer.findOne({ where: { email: key } });
    if (!customer) return res.status(404).json({ message: 'Customer not found!' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await customer.update({ password: hashed });
    delete otpStore[key];

    sendMail(
      key,
      'Password Changed Successfully — ARS Fashion World',
      `
        <div style="font-family:sans-serif;max-width:440px;margin:auto;padding:28px;border:1px solid #eee;border-radius:10px">
          <h2 style="color:#d1a309">ARS Fashion World</h2>
          <p>Hi <strong>${customer.name}</strong>,</p>
          <p>Your password has been <strong>successfully updated</strong>. ✅</p>
          <p style="color:#555">You can now login with your new password.</p>
          <p style="color:#999;font-size:12px">If you didn't make this change, please contact our support immediately.</p>
        </div>
      `
    );

    res.json({ message: 'Password updated successfully! You can now login with your new password.' });
  } catch (error) {
    console.error('resetPassword error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// 14. SEND DELIVERY REVIEW MAIL
exports.sendDeliveryReviewMail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { Product } = require('../models/index');

    const order = await Order.findOne({
      where: { orderId },
      include: [
        { model: Customer, attributes: ['name', 'email'] },
        {
          model: OrderSlot,
          as: 'slots',
          include: [{ model: Product, attributes: ['name'], required: false }],
        },
      ],
    });

    if (!order) return res.status(404).json({ message: 'Order not found!' });
    if (!order.Customer) return res.status(400).json({ message: 'Customer data missing!' });

    const customerName  = order.Customer.name;
    const customerEmail = order.Customer.email;

    const deliveryDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    const paymentMethod = order.paymentMethod || 'Online Payment';
    const supportPhone  = process.env.SUPPORT_PHONE || '+91 98765 43210';
    const supportEmail  = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

    const itemRows = (order.slots || [])
      .map(s => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e8d0;color:#333">
            ${s.Product ? s.Product.name : 'Item'}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e8d0;color:#555;text-align:center">
            × ${s.quantity || 1}
          </td>
        </tr>`)
      .join('');

    await sendMail(
      customerEmail,
      `Your Order #${orderId} Has Been Delivered! 🛍️ — ARS Fashion`,
      `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;background:#fff;border:1px solid #e8d99a;border-radius:12px;overflow:hidden">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#d1a309,#f0c929);padding:28px 32px;text-align:center">
          <h1 style="margin:0;font-size:24px;color:#fff;letter-spacing:1px">ARS Fashion World</h1>
          <p style="margin:6px 0 0;color:#fff3cc;font-size:13px">Your style, delivered.</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px">
          <p style="font-size:16px;color:#333;margin:0 0 6px">Hi <strong>${customerName}</strong>,</p>
          <p style="font-size:15px;color:#555;margin:0 0 24px">
            We're happy to inform you that your order has been
            <strong style="color:#d1a309">successfully delivered!</strong> 🛍️
          </p>

          <!-- Order Details -->
          <div style="background:#fffbee;border:1px solid #f0e8d0;border-radius:8px;padding:16px 20px;margin-bottom:24px">
            <p style="margin:0 0 12px;font-size:14px;font-weight:bold;color:#b8860b">📦 Order Details</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#555">
              <tr>
                <td style="padding:5px 0;width:45%">Order ID</td>
                <td style="padding:5px 0;color:#333;font-weight:bold">#${orderId}</td>
              </tr>
              <tr>
                <td style="padding:5px 0">Delivery Date</td>
                <td style="padding:5px 0;color:#333">${deliveryDate}</td>
              </tr>
              <tr>
                <td style="padding:5px 0">Payment Method</td>
                <td style="padding:5px 0;color:#333">${paymentMethod}</td>
              </tr>
            </table>
          </div>

          <!-- Items Delivered -->
          ${itemRows ? `
          <p style="font-size:14px;font-weight:bold;color:#b8860b;margin:0 0 8px">🛒 Items Delivered</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #f0e8d0;border-radius:8px;overflow:hidden;margin-bottom:24px">
            <thead>
              <tr style="background:#fdf3d0">
                <th style="padding:10px 12px;text-align:left;color:#b8860b;font-weight:600">Product</th>
                <th style="padding:10px 12px;text-align:center;color:#b8860b;font-weight:600">Qty</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>` : ''}

          <!-- We Hope You Love It -->
          <div style="background:#fff8e6;border-left:4px solid #d1a309;border-radius:0 6px 6px 0;padding:14px 16px;margin-bottom:24px">
            <p style="margin:0;font-size:14px;color:#555;line-height:1.6">
              💖 <strong>We Hope You Love It!</strong><br>
              Thank you for shopping with ARS Fashion. We hope you enjoy your purchase
              and we'd love to hear your feedback!
            </p>
          </div>

          <!-- Need Help -->
          <div style="background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:16px 20px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#555">🔄 Need Help?</p>
            <p style="margin:0 0 10px;font-size:13px;color:#666;line-height:1.6">
              If you have any issues with your order or want to request a return/exchange,
              feel free to contact us.
            </p>
            <p style="margin:0;font-size:13px;color:#555">
              📞 <strong>Support:</strong> ${supportPhone}
              &nbsp;&nbsp;
              📧 <strong>Email:</strong> ${supportEmail}
            </p>
          </div>

          <p style="font-size:13px;color:#888;margin:0">
            Warm regards,<br>
            <strong style="color:#d1a309">Team ARS Fashion</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#fdf3d0;padding:14px 32px;text-align:center;border-top:1px solid #e8d99a">
          <p style="margin:0;font-size:11px;color:#a08030">ARS Fashion World — Stay Stylish! ✨</p>
        </div>
      </div>
      `
    );

    res.json({ message: 'Thank you / review mail sent to customer!' });
  } catch (error) {
    console.error('sendDeliveryReviewMail error:', error.message);
    res.status(500).json({ error: error.message });
  }
};