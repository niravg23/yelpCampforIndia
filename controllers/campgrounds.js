const { cloudinary } = require('../cloudinary')
const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({})
    res.render('index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('new')
}
module.exports.editCampground = async(req, res, next) => {
    const id = req.params.id;
    const foundCampground = await Campground.findById(id);
    if (!foundCampground) {
        req.flash('error', 'Cannot find a Campground.')
        return res.redirect('/campgrounds')
    }
    res.render('edit', { foundCampground })
}

module.exports.showCampground = async(req, res) => {
    const id = req.params.id;
    const foundCampground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!foundCampground) {
        req.flash('error', 'Cannot find a Campground.')
        return res.redirect('/campgrounds')
    }
    res.render('show', { foundCampground })
}

module.exports.createCampground = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground.id}`)
}

module.exports.updateCampground = async(req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const id = req.params.id;
    const foundCampground = await Campground.findById(id);
    foundCampground.geometry = geoData.body.features[0].geometry
    await Campground.findByIdAndUpdate(id, req.body.campground)
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    foundCampground.images.push(...imgs)
    await foundCampground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await foundCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated a campground!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async(req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted a campground!')
    res.redirect('/campgrounds')
}