if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
require('dotenv').config();


const express = require('express')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const passport = require('passport')
const localStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const mongoDbStore = require("connect-mongo");

const expressError = require('./utils/expressError')
const catchAsync = require('./utils/catchAsync')
const app = express();
const userRoutes = require('./routes/user')
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/review')
const User = require('./models/user')

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)

app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);

// const dbUrl = 'mongodb://localhost:27017/yelpcamp';
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpcamp';
const secret = process.env.SECRET || 'blackdottedCat';

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
        console.log("Mongo connection is open")
    })
    .catch(err => {
        console.log("Oops Error!")
        console.log(err)
    })

const store = new mongoDbStore({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ducihup/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 8080
app.listen(port, (req, res) => {
    console.log(`Serving on ${port}`)
})