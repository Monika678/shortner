// services/urlService/urlService.js
const ShortUrl = require('../../models/ShortUrl');
const { nanoid } = require('nanoid');
const redis = require('../../utils/redis');

// Create Short URL
const createShortUrl = async (longUrl, customAlias, topic, userId) => {
    if (!/^https?:\/\//.test(longUrl)) {
        throw new Error('Invalid URL');
    }

    // Generate custom alias or use a random one
    const alias = customAlias || nanoid(8);

    // Create new short URL entry
    const shortUrl = new ShortUrl({
        userId,
        longUrl,
        alias,
        topic,
    });

    await shortUrl.save();

    // Cache the short URL for quick lookup
    redis.set(`shortUrl:${alias}`, longUrl);

    return {
        shortUrl: `${process.env.BASE_URL}/${alias}`,
        createdAt: new Date(),
    };
};

// Redirect to original URL
const redirectToOriginalUrl = async (alias) => {
    // Check cache first
    let longUrl = await redis.get(`shortUrl:${alias}`);

    if (!longUrl) {
        // If not cached, fetch from DB
        const shortUrl = await ShortUrl.findOne({ alias });
        if (!shortUrl) {
            throw new Error('Short URL not found');
        }
        longUrl = shortUrl.longUrl;

        // Cache the long URL
        redis.set(`shortUrl:${alias}`, longUrl);
    }

    return longUrl;
};

// Log redirect analytics (can be extended with more metrics)
const logRedirectAnalytics = (shortUrl, userAgent, ip) => {
    // Implement analytics logging (e.g., save in a database)
    console.log(`Redirected from ${shortUrl.alias}: ${userAgent}, IP: ${ip}`);
};

module.exports = { createShortUrl, redirectToOriginalUrl, logRedirectAnalytics };
