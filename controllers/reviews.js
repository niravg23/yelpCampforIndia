const Review = require('../models/review')
const Campground = require('../models/campground')

module.exports.createReview = async(req, res, next) => {
    const id = req.params.id;
    const foundCampground = await (await Campground.findById(id))
    const review = new Review(req.body.fb)
    review.author = req.user._id
    foundCampground.reviews.push(review)
    await foundCampground.save()
    await review.save()
    req.flash('success', 'Successfully added your review.')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async(req, res) => {
    const id = req.params.id;
    const reviewId = req.params.reviewId;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    const foundReview = await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted your review.')
    res.redirect(`/campgrounds/${id}`)
}