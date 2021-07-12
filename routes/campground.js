const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const Campground = require('../models/campground')
const expressError = require('../utils/expressError')
const catchAsync = require('../utils/catchAsync')
const campgrounds = require('../controllers/campgrounds')
const { campgroundSchema } = require('../schemas.js')
const { storage } = require('../cloudinary')
const upload = multer({ storage })
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')

const app = express();
const router = express.Router()

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, (campgrounds.renderNewForm))

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground))

module.exports = router;