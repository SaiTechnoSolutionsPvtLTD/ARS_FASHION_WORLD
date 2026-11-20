const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderSlot = sequelize.define('OrderSlot', {
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    orderId: { 
        type: DataTypes.STRING, 
        allowNull: false
    },


    productId: { 
        type: DataTypes.INTEGER, 
        allowNull: true   
    },
    variantId: { 
        type: DataTypes.INTEGER, 
        allowNull: true   
    },

    productName: {
        type: DataTypes.STRING,
        allowNull: true   
    },
    productImage: {
        type: DataTypes.STRING,
        allowNull: true   
    },
    variantLabel: {
        type: DataTypes.STRING,
        allowNull: true   
    },

    salesPrice: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false 
    },
    quantity: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
});

module.exports = OrderSlot;
