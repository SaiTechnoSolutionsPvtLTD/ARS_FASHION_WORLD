const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Deal = sequelize.define('Deal', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    expiryDate: { type: DataTypes.DATE, allowNull: false },
    buttonText: { type: DataTypes.STRING, defaultValue: "SHOP NOW" },
    buttonLink: { type: DataTypes.STRING, defaultValue: "/shop" },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    timestamps: true,
    tableName: 'deals'
});

module.exports = Deal;