// FILE PATH: ars-fashion-backend/models/index.js
// ACTION   : REPLACE FULL FILE

const sequelize = require('../config/db');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const Thumbnail = require('./Thumbnail');
const Category = require('./Category');
const Customer = require('./Customer');
const CustomerAddress = require('./CustomerAddress');
const ShippingAddress = require('./ShippingAddress');
const Order = require('./Order');
const OrderSlot = require('./OrderSlot');
const Admin = require('./Admin');
const Review = require('./Review');
const BestSeller = require('./BestSeller');
const TrendingProduct = require('./TrendingProduct');
const NewArrival = require('./NewArrival');
const Banner = require('./Banner');
const OfferBanner = require('./OfferBanner');
const ContactMessage = require('./ContactMessage');
const Cart = require('./Cart');
const Wishlist = require('./Wishlist');
const Deal = require('./Deal');
const Coupon = require('./Coupon');
const ShippingRate = require('./ShippingRate'); // ← NEW

// --- Relationships ---

Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Product & Variants/Thumbnails — CASCADE DELETE
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(Thumbnail, { foreignKey: 'productId', as: 'thumbnails', onDelete: 'CASCADE' });
Thumbnail.belongsTo(Product, { foreignKey: 'productId' });

// Customer & Addresses
Customer.hasMany(CustomerAddress, { foreignKey: 'customerId', onDelete: 'CASCADE' });
CustomerAddress.belongsTo(Customer, { foreignKey: 'customerId' });

Customer.hasMany(ShippingAddress, { foreignKey: 'customerId', onDelete: 'CASCADE' });
ShippingAddress.belongsTo(Customer, { foreignKey: 'customerId' });

// Customer & Orders
Customer.hasMany(Order, { foreignKey: 'customerId' });
Order.belongsTo(Customer, { foreignKey: 'customerId' });

Order.hasMany(OrderSlot, { foreignKey: 'orderId', as: 'slots', onDelete: 'CASCADE' });
OrderSlot.belongsTo(Order, { foreignKey: 'orderId' });

OrderSlot.belongsTo(Product, { foreignKey: 'productId', onDelete: 'SET NULL' });
Product.hasMany(OrderSlot, { foreignKey: 'productId', onDelete: 'SET NULL' });

OrderSlot.belongsTo(ProductVariant, { foreignKey: 'variantId', onDelete: 'SET NULL' });
ProductVariant.hasMany(OrderSlot, { foreignKey: 'variantId', onDelete: 'SET NULL' });

// Customer & Reviews
Customer.hasMany(Review, { foreignKey: 'customerId', onDelete: 'CASCADE' });
Review.belongsTo(Customer, { foreignKey: 'customerId', as: 'customerInfo' });

Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'productInfo' });

// Review -> Order
Order.hasMany(Review, { foreignKey: 'orderId', onDelete: 'SET NULL' });
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'orderInfo' });

Product.hasOne(BestSeller, { foreignKey: 'productId', as: 'bestSeller', onDelete: 'CASCADE' });
BestSeller.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasOne(TrendingProduct, { foreignKey: 'productId', as: 'trending', onDelete: 'CASCADE' });
TrendingProduct.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasOne(NewArrival, { foreignKey: 'productId', as: 'newArrival', onDelete: 'CASCADE' });
NewArrival.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Cart & Wishlist
Customer.hasMany(Cart, { foreignKey: 'customerId', as: 'cartItems', onDelete: 'CASCADE' });
Cart.belongsTo(Customer, { foreignKey: 'customerId' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(Cart, { foreignKey: 'productId', onDelete: 'CASCADE' });
Cart.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

Customer.hasMany(Wishlist, { foreignKey: 'customerId', as: 'wishlistItems', onDelete: 'CASCADE' });
Wishlist.belongsTo(Customer, { foreignKey: 'customerId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(Wishlist, { foreignKey: 'productId', onDelete: 'CASCADE' });

Coupon.hasMany(Order, { foreignKey: 'couponId', as: 'orders' });
Order.belongsTo(Coupon, { foreignKey: 'couponId', as: 'appliedCoupon' });

Order.belongsTo(ShippingAddress, { foreignKey: 'shippingAddressId', as: 'orderShipping' });
ShippingAddress.hasMany(Order, { foreignKey: 'shippingAddressId', as: 'ordersWithShipping' });

module.exports = {
    sequelize,
    Product, ProductVariant, Thumbnail,
    Category, Admin,
    Customer, CustomerAddress, ShippingAddress,
    Order, OrderSlot, OrderItem: OrderSlot,
    Review,
    BestSeller, TrendingProduct, NewArrival, Banner, OfferBanner, Cart, Wishlist, Deal,
    Coupon,
    ShippingRate, // ← NEW
};