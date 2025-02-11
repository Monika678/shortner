// urlController.js
const ShortUrl = require('../models/ShortUrl');  // Assuming you have a ShortUrl model for your database
const { nanoid } = require('nanoid');
const redis = require('../utils/redis');  // Redis instance for caching
const rateLimiter = require('../middleware/rateLimiter');  // Rate limiter middleware

// Create Short URL
const shortenUrl = async (req, res) => {
    const { longUrl, customAlias, topic } = req.body;
    const userId = req.userId;  // Assuming `userId` is set from middleware after authentication

    // Validate URL
    if (!longUrl || !/^https?:\/\//.test(longUrl)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Check for custom alias and generate one if not provided
    const alias = customAlias || nanoid(8);

    // Create short URL entry
    const shortUrl = new ShortUrl({
        userId,
        longUrl,
        alias,
        topic,
    });

    await shortUrl.save();

    // Cache the short URL in Redis for quick lookup
    redis.set(`shortUrl:${alias}`, longUrl);

    return res.json({
        shortUrl: `${process.env.BASE_URL}/${alias}`,
        createdAt: new Date(),
    });
};

// Redirect Short URL
const redirectToUrl = async (req, res) => {
    const { alias } = req.params;

    // Check cache first
    const longUrl = await redis.get(`shortUrl:${alias}`);

    if (longUrl) {
        return res.redirect(longUrl);
    }

    // If not in cache, fetch from DB
    const shortUrl = await ShortUrl.findOne({ alias });

    if (!shortUrl) {
        return res.status(404).json({ error: 'Short URL not found' });
    }

    // Log the analytics (e.g., IP, timestamp, user agent)
    logRedirectAnalytics(shortUrl);

    // Cache it for future requests
    redis.set(`shortUrl:${alias}`, shortUrl.longUrl);

    return res.redirect(shortUrl.longUrl);
};

// Analytics logging for redirects
const logRedirectAnalytics = (shortUrl) => {
    // Logic for logging analytics (e.g., using a third-party analytics tool or database)
};

module.exports = { shortenUrl, redirectToUrl };
