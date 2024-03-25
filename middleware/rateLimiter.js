const rateLimite = require('express-rate-limit');


const rateLimiter = rateLimite({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    max: 100, //max number of request during the window
    message: 'You have exceeded the 100 requests in 24 hrs limit!',
    standardHeaders: true, // standardHeaders, which specifies whether the appropriate headers should be added to the response showing the enforced limit 
    //   (X-RateLimit-Limit), current usage (X-RateLimit-Remaining), and time to wait before retrying (Retry-After) when the limit is reached
    legacyHeaders: false,
});

module.exports = rateLimiter;