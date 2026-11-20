const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    },
    description: { 
        type: DataTypes.TEXT 
    },
    mainImage: { 
        type: DataTypes.STRING 
    },
    mrpPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
    },
    salesPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
    },
    categoryId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Categories',
            key: 'id'
        }
    },
    status: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
});

module.exports = Product;