// services/analyticsService/analyticsService.js
const ShortUrl = require('../../models/ShortUrl');
const Analytics = require('../../models/Analytics');

// Get analytics for a specific URL
const getUrlAnalytics = async (alias) => {
    const shortUrl = await ShortUrl.findOne({ alias });
    if (!shortUrl) {
        throw new Error('Short URL not found');
    }

    const analytics = await Analytics.find({ shortUrlId: shortUrl._id });

    return {
        totalClicks: analytics.length,
        uniqueUsers: getUniqueUsers(analytics),
        clicksByDate: aggregateClicksByDate(analytics),
    };
};

// Get topic-based analytics
const getTopicAnalytics = async (topic) => {
    const shortUrls = await ShortUrl.find({ topic });

    const allAnalytics = await Analytics.find({ shortUrlId: { $in: shortUrls.map(url => url._id) } });

    return {
        totalClicks: allAnalytics.length,
        uniqueUsers: getUniqueUsers(allAnalytics),
        clicksByDate: aggregateClicksByDate(allAnalytics),
        urls: shortUrls.map(url => ({
            shortUrl: `${process.env.BASE_URL}/${url.alias}`,
            totalClicks: allAnalytics.filter(a => a.shortUrlId.toString() === url._id.toString()).length,
            uniqueUsers: getUniqueUsers(allAnalytics.filter(a => a.shortUrlId.toString() === url._id.toString())),
        })),
    };
};

// Get overall user analytics
const getOverallAnalytics = async (userId) => {
    const shortUrls = await ShortUrl.find({ userId });

    const allAnalytics = await Analytics.find({ shortUrlId: { $in: shortUrls.map(url => url._id) } });

    return {
        totalUrls: shortUrls.length,
        totalClicks: allAnalytics.length,
        uniqueUsers: getUniqueUsers(allAnalytics),
        clicksByDate: aggregateClicksByDate(allAnalytics),
    };
};

// Utility functions
const getUniqueUsers = (analytics) => {
    const uniqueUsers = new Set(analytics.map(a => a.userId));
    return uniqueUsers.size;
};

const aggregateClicksByDate = (analytics) => {
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
