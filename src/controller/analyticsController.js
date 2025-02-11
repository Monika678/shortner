// analyticsController.js
const ShortUrl = require('../models/ShortUrl');  // Assuming you have a ShortUrl model
const Analytics = require('../models/Analytics');  // Assuming you have an Analytics model

// Get URL-specific analytics
const getUrlAnalytics = async (req, res) => {
    const { alias } = req.params;

    const shortUrl = await ShortUrl.findOne({ alias });

    if (!shortUrl) {
        return res.status(404).json({ error: 'Short URL not found' });
    }

    const analytics = await Analytics.find({ shortUrlId: shortUrl._id });

    return res.json({
        totalClicks: analytics.length,
        uniqueUsers: getUniqueUsers(analytics),
        clicksByDate: aggregateClicksByDate(analytics),
    });
};

// Get topic-based analytics
const getTopicAnalytics = async (req, res) => {
    const { topic } = req.params;

    const shortUrls = await ShortUrl.find({ topic });

    const allAnalytics = await Analytics.find({ shortUrlId: { $in: shortUrls.map(url => url._id) } });

    return res.json({
        totalClicks: allAnalytics.length,
        uniqueUsers: getUniqueUsers(allAnalytics),
        clicksByDate: aggregateClicksByDate(allAnalytics),
        urls: shortUrls.map(url => ({
            shortUrl: `${process.env.BASE_URL}/${url.alias}`,
            totalClicks: allAnalytics.filter(a => a.shortUrlId.toString() === url._id.toString()).length,
            uniqueUsers: getUniqueUsers(allAnalytics.filter(a => a.shortUrlId.toString() === url._id.toString())),
        })),
    });
};

// Get overall user analytics
const getOverallAnalytics = async (req, res) => {
    const userId = req.userId;  // Assuming `userId` is set from middleware after authentication

    const shortUrls = await ShortUrl.find({ userId });

    const allAnalytics = await Analytics.find({ shortUrlId: { $in: shortUrls.map(url => url._id) } });

    return res.json({
        totalUrls: shortUrls.length,
        totalClicks: allAnalytics.length,
        uniqueUsers: getUniqueUsers(allAnalytics),
        clicksByDate: aggregateClicksByDate(allAnalytics),
    });
};

// Utility functions
const getUniqueUsers = (analytics) => {
    const uniqueUsers = new Set(analytics.map(a => a.userId));
    return uniqueUsers.size;
};

const aggregateClicksByDate = (analytics) => {
    // Aggregate analytics by date (e.g., last 7 days)
    const clicksByDate = analytics.reduce((acc, a) => {
        const date = a.timestamp.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date]++;
        return acc;
    }, {});

    return Object.keys(clicksByDate).map(date => ({
        date,
        clickCount: clicksByDate[date],
    }));
};

module.exports = { getUrlAnalytics, getTopicAnalytics, getOverallAnalytics };
