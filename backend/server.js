// FILE PATH: ars-fashion-backend/server.js
// ACTION   : REPLACE FULL FILE (added /api/shipping route)

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const { sequelize } = require('./models/index');

const app = express();

const corsOptions = {
    origin: function (origin, callback) {
        const allowed = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
            process.env.FRONTEND_URL,
        ].filter(Boolean);

        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin',          require('./routes/adminRoutes'));
app.use('/api/categories',     require('./routes/categoryRoutes'));
app.use('/api/subcategories',  require('./routes/subCategoryRoutes'));
app.use('/api/brands',         require('./routes/brandRoutes'));
app.use('/api/banners',        require('./routes/bannerRoutes'));
app.use('/api/offer-banners',  require('./routes/offerBannerRoutes'));
app.use('/api/contact',        require('./routes/contactRoutes'));
app.use('/api/coupons',        require('./routes/couponRoutes'));
app.use('/api/products',       require('./routes/productRoutes'));
app.use('/api/variants',       require('./routes/variantRoutes'));
app.use('/api/thumbnails',     require('./routes/thumbRoutes'));
app.use('/api/customers',      require('./routes/customerRoutes'));
app.use('/api/orders',         require('./routes/orderRoutes'));
app.use('/api/reviews',        require('./routes/reviewRoutes'));
app.use('/api/dashboard',      require('./routes/dashboardRoutes'));
app.use('/api/collections',    require('./routes/collectionRoutes'));
app.use('/api/deals',          require('./routes/dealRoutes'));
app.use('/api/Cart',           require('./routes/cartRoutes'));
app.use('/api/wishlist',       require('./routes/whislistRoutes'));
app.use('/api/payment',        require('./routes/paymentRoutes'));
app.use('/api/shipping',       require('./routes/shippingRoutes'));   // ← NEW

app.get('/', (req, res) => res.send('ARS Fashion World API Running'));

const PORT = process.env.PORT || 7000;

const { deleteExpiredDeals } = require('./controllers/dealController');

// NOTE: First time run with alter: true to create ShippingRates table & add shippingAmount column.
// After table is created, switch back to alter: false.
sequelize.sync({ alter: false }).then(() => {
    console.log('DB Connected & Synced');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        deleteExpiredDeals();
        setInterval(deleteExpiredDeals, 60 * 60 * 1000);
        console.log('Deal expiry cleanup scheduler started (runs every hour)');
    });
}).catch(err => console.error('Sync Error:', err));