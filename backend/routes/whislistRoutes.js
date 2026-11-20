const express = require('express');
const router = express.Router();
const wishCtrl = require('../controllers/whislistController');

router.get('/:customerId',                          wishCtrl.getWishlist);
router.post('/toggle',                              wishCtrl.toggleWishlist);
router.delete('/remove/:id',                        wishCtrl.removeFromWishlist);
router.get('/check/:customerId/:productId',         wishCtrl.checkWishlist);

module.exports = router;