# shortner
This project is a URL shortening platform that enables multiple users to generate short URLs and monitor analytics, including both individual and overall statistics for their created links

## Features
- **URL Shortening**: Allows users to create shortened links for any provided URL.
- **Click Analytics**: Monitors and displays the click count for each link, along with the number of distinct users.
- **Daily Click Data**: Tracks and stores click statistics for the past 7 days.
- **Unique Visitor Identification**: Utilizes Redis to track unique visitors based on their IP addresses.
- **Secure Access**: Employs token-based authentication to protect sensitive endpoints.

## controllers Summary
- **AuthController**: Handles Google Sign-In login and registration.
- **UrlController**:Handles URL shortening, redirection, and analytics logging.
- **AnalyticsController**: Fetches analytics for specific URLs, topics, and overall performance.