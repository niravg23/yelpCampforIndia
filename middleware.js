const { campgroundSchema } = require('./schemas.js')
const { reviewSchema } = require('./schemas.js')
const expressError = require('./utils/expressError')
const Campground = require('./models/campground')
const Review = require('./models/review')

module.exports.isLoggedIn = function(req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!')
        return res.redirect('/login')
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',')
        throw new expressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const id = req.params.id;
    const foundCampground = await Campground.findById(id);
    if (!foundCampground.author.equals(req.user._id)) {
        req.flash('error', `You don't have purmission to edit it!`)
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const id = req.params.id;
    const reviewId = req.params.reviewId;
    const foundReview = await Review.findById(reviewId)
    if (!foundReview.author.equals(req.user._id)) {
        req.flash('error', `You don't have purmission to edit it!`)
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',')
        throw new expressError(msg, 400)
    } else {
        next();
    }
}