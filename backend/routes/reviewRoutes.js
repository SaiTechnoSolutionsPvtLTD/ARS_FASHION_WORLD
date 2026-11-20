// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');



// Admin
router.get('/all', reviewController.getAllReviews);
router.put('/update/:id', reviewController.updateReview);
router.delete('/delete/:id', reviewController.deleteReview);

router.get('/product/:productId', reviewController.getPublishedReviewsByProduct);

router.post('/create', reviewController.createFeedback);

router.get('/:id', reviewController.getParticularReview);

module.exports = router;