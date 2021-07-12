const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)


module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string()
            .min(3)
            .required()
            .escapeHTML(),
        location: Joi.string()
            .required()
            .escapeHTML(),
        description: Joi.string()
            .min(3)
            .required()
            .escapeHTML(),
        price: Joi.number()
            .min(0)
            .required()
    }).required(),
    deleteImages: Joi.array()
})


module.exports.reviewSchema = Joi.object({
    fb: Joi.object({
        rating: Joi.number()
            .min(0)
            .max(5)
            .required(),
        review: Joi.string()
            .required()
            .escapeHTML()
    }).required()
})