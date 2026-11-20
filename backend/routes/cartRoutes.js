const express = require('express');
const router = express.Router();
const cartCtrl = require('../controllers/cartController');

router.get('/:customerId',           cartCtrl.getCart);
router.post('/add',                  cartCtrl.addToCart);
router.put('/update/:id',            cartCtrl.updateCartItem);
router.delete('/remove/:id',         cartCtrl.removeFromCart);
router.delete('/clear/:customerId',  cartCtrl.clearCart);

module.exports = router;