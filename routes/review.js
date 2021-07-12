const express = require('express')
const mongoose = require('mongoose')
const Review = require('../models/review')
const Campground = require('../models/campground')
const expressError = require('../utils/expressError')
const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/reviews')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

const app = express();
const router = express.Router({ mergeParams: true })

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router