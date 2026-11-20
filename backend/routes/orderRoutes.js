const router      = require('express').Router();
const orderCtrl   = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware'); 


router.post('/place',                   authMiddleware, orderCtrl.placeOrder);
router.get('/recent',                   orderCtrl.getRecentOrders);
router.get('/all',                      orderCtrl.getAllOrders);
router.get('/customer/:customerId',     authMiddleware, orderCtrl.getOrdersByCustomer);
router.put('/update/:id',               orderCtrl.updateStatus);
router.delete('/delete/:id',            orderCtrl.deleteOrder);

module.exports = router;