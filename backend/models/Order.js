// FILE PATH: ars-fashion-backend/models/Order.js
// ACTION   : REPLACE FULL FILE (added shippingAmount field)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
    orderId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    shippingAmount: {          // ← NEW: state-wise shipping charge stored here
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: true,
    },
    paymentStatus: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
        defaultValue: 'Pending'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'Online'
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    orderStatus: {
        type: DataTypes.ENUM(
            'Pending',
            'Confirmed',
            'Shipped',
            'Out for Delivery',
            'Delivered',
            'Cancelled'
        ),
        defaultValue: 'Pending'
    },
    couponId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    shippingAddressId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    snapName:        { type: DataTypes.STRING, allowNull: true },
    snapPhone:       { type: DataTypes.STRING, allowNull: true },
    snapAddressLine: { type: DataTypes.STRING, allowNull: true },
    snapCity:        { type: DataTypes.STRING, allowNull: true },
    snapDistrict:    { type: DataTypes.STRING, allowNull: true },
    snapState:       { type: DataTypes.STRING, allowNull: true },
    snapPincode:     { type: DataTypes.STRING(6), allowNull: true },

}, {
    timestamps: true
});

module.exports = Order;