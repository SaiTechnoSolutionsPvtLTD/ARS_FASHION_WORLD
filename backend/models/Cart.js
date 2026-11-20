const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cart = sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    variantId: { type: DataTypes.INTEGER, allowNull: true },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
    salesPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});

module.exports = Cart;