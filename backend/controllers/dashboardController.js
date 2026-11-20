
const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

exports.getAdminDashboardStats = async (req, res) => {
    try {

        // ── 1. Total Sales (Delivered only)
        const salesRows = await sequelize.query(
            `SELECT COALESCE(SUM(totalAmount), 0) AS totalSales
             FROM Orders WHERE orderStatus = 'Delivered'`,
            { type: QueryTypes.SELECT }
        );

        // 2. Total Orders
        const ordersRows = await sequelize.query(
            `SELECT COUNT(*) AS totalOrders FROM Orders`,
            { type: QueryTypes.SELECT }
        );

        //  3. Registered User
        const usersRows = await sequelize.query(
            `SELECT COUNT(*) AS totalRegistered FROM Customers`,
            { type: QueryTypes.SELECT }
        );

        // 4. Active Customers 
        const custRows = await sequelize.query(
            `SELECT COUNT(DISTINCT customerId) AS totalCustomers FROM Orders`,
            { type: QueryTypes.SELECT }
        );

        //  5. New Orders Today 
        const todayRows = await sequelize.query(
            `SELECT COUNT(*) AS newOrdersToday
             FROM Orders WHERE DATE(createdAt) = CURDATE()`,
            { type: QueryTypes.SELECT }
        );

        //  6. Today Deliveries (orders delivered today)
        const deliveredTodayRows = await sequelize.query(
            `SELECT COUNT(*) AS deliveredToday
             FROM Orders
             WHERE orderStatus = 'Delivered'
               AND DATE(updatedAt) = CURDATE()`,
            { type: QueryTypes.SELECT }
        );

        //  7. Top Selling Products 
       
        const topProducts = await sequelize.query(
            `SELECT
                os.productId,
                SUM(os.quantity)                 AS totalSold,
                SUM(os.salesPrice * os.quantity) AS totalRevenue,
                p.name                           AS productName,
                (SELECT t.image FROM Thumbnails t
                 WHERE t.productId = p.id
                 ORDER BY t.id ASC LIMIT 1)      AS thumbImage
             FROM OrderSlots os
             JOIN Products p ON p.id = os.productId
             GROUP BY os.productId, p.name
             ORDER BY totalSold DESC
             LIMIT 8`,
            { type: QueryTypes.SELECT }
        );

       
        const topProductsFormatted = topProducts.map(p => ({
            productId:    p.productId,
            totalSold:    parseInt(p.totalSold)       || 0,
            totalRevenue: parseFloat(p.totalRevenue)  || 0,
            Product: {
                name: p.productName,
                
                Thumbnails: p.thumbImage ? [{ url: p.thumbImage, image: p.thumbImage }] : [],
                thumbnails: p.thumbImage ? [{ url: p.thumbImage, image: p.thumbImage }] : []
            }
        }));

        // 7. Monthly Revenue — Delivered orders 
        const revenueChart = await sequelize.query(
            `SELECT
                MONTHNAME(createdAt)             AS month,
                MONTH(createdAt)                 AS monthNum,
                COALESCE(SUM(totalAmount), 0)    AS val,
                COUNT(*)                         AS orderCount
             FROM Orders
             WHERE orderStatus = 'Delivered'
             GROUP BY MONTH(createdAt), MONTHNAME(createdAt)
             ORDER BY MONTH(createdAt) ASC`,
            { type: QueryTypes.SELECT }
        );

        //  8. All Orders — monthly (for Order Volume bar chart)
        const allRevenueChart = await sequelize.query(
            `SELECT
                MONTHNAME(createdAt)             AS month,
                MONTH(createdAt)                 AS monthNum,
                COALESCE(SUM(totalAmount), 0)    AS val,
                COUNT(*)                         AS orderCount
             FROM Orders
             GROUP BY MONTH(createdAt), MONTHNAME(createdAt)
             ORDER BY MONTH(createdAt) ASC`,
            { type: QueryTypes.SELECT }
        );

        // 9. Order Status Distribution
        const statusDist = await sequelize.query(
            `SELECT orderStatus, COUNT(*) AS count
             FROM Orders GROUP BY orderStatus`,
            { type: QueryTypes.SELECT }
        );

        //  10. New Registrations — last 30 days, day-wise
        const newUsersDaily = await sequelize.query(
            `SELECT
                DATE(createdAt) AS date,
                COUNT(*)        AS count
             FROM Customers
             WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(createdAt)
             ORDER BY DATE(createdAt) ASC`,
            { type: QueryTypes.SELECT }
        );

        //  11. New Orders 
        const newOrdersDaily = await sequelize.query(
            `SELECT
                DATE(createdAt)              AS date,
                COUNT(*)                     AS count,
                COALESCE(SUM(totalAmount),0) AS revenue
             FROM Orders
             WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(createdAt)
             ORDER BY DATE(createdAt) ASC`,
            { type: QueryTypes.SELECT }
        );

        //  Send response
        res.json({
            stats: {
                totalSales:      parseFloat(salesRows[0]?.totalSales)   || 0,
                totalOrders:     parseInt(ordersRows[0]?.totalOrders)    || 0,
                totalRegistered: parseInt(usersRows[0]?.totalRegistered) || 0,
                totalCustomers:  parseInt(custRows[0]?.totalCustomers)   || 0,
                newOrdersToday:  parseInt(todayRows[0]?.newOrdersToday)  || 0,
                deliveredToday:  parseInt(deliveredTodayRows[0]?.deliveredToday) || 0
            },
            topProducts:    topProductsFormatted,
            revenueChart,
            allRevenueChart,
            statusDist,
            newUsersDaily,
            newOrdersDaily
        });

    } catch (error) {
        console.error(' Dashboard Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};