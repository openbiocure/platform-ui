const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { ViolationTypes } = require('openbiocure-data-provider');
const { removePorts, isEnabled } = require('~/server/utils');
const ioredisClient = require('~/cache/ioredisClient');
const { logViolation } = require('~/cache');
const { logger } = require('~/config');

const {
  VERIFY_EMAIL_WINDOW = 2,
  VERIFY_EMAIL_MAX = 2,
  VERIFY_EMAIL_VIOLATION_SCORE: score,
} = process.env;
const windowMs = VERIFY_EMAIL_WINDOW * 60 * 1000;
const max = VERIFY_EMAIL_MAX;
const windowInMinutes = windowMs / 60000;
const message = `Too many attempts, please try again after ${windowInMinutes} minute(s)`;

const handler = async (req, res) => {
  const type = ViolationTypes.VERIFY_EMAIL_LIMIT;
  const errorMessage = {
    type,
    max,
    windowInMinutes,
  };

  await logViolation(req, res, type, errorMessage, score);
  return res.status(429).json({ message });
};

const limiterOptions = {
  windowMs,
  max,
  handler,
  keyGenerator: removePorts,
};

if (isEnabled(process.env.USE_REDIS) && ioredisClient) {
  logger.debug('Using Redis for verify email rate limiter.');
  const store = new RedisStore({
    sendCommand: (...args) => ioredisClient.call(...args),
    prefix: 'verify_email_limiter:',
  });
  limiterOptions.store = store;
}

const verifyEmailLimiter = rateLimit(limiterOptions);

module.exports = verifyEmailLimiter;
