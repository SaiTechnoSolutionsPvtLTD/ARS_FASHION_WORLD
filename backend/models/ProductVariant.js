const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductVariant = sequelize.define('ProductVariant', {
    size: {
        type: DataTypes.ENUM('All Sizes', 'Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL'), 
        defaultValue: 'All Sizes'
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mrpPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    salesPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = ProductVariant;