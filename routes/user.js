const express = require('express')
const passport = require('passport')
const User = require('../models/user')
const expressError = require('../utils/expressError')
const catchAsync = require('../utils/catchAsync');
const { findOne } = require('../models/user');
const users = require('../controllers/users')

const app = express();
const router = express.Router()

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser)

router.get('/logout', users.logoutUser)

module.exports = router