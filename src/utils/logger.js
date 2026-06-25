/**
 * Logger Utility — Centralised logging with level filtering.
 * Set VITE_LOG_LEVEL=debug|info|warn|error in your .env to control output.
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

const getCurrentLogLevel = () => {
  const level = import.meta.env.VITE_LOG_LEVEL || "info";
  return LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO;
};

/**
 * Returns a formatted prefix string.
 * The caller is responsible for spreading `data` as a second console argument.
 */
const formatPrefix = (level) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}]`;
};

const logger = {
  debug: (message, data) => {
    if (getCurrentLogLevel() <= LOG_LEVELS.DEBUG) {
      data !== undefined
        ? console.debug(formatPrefix("DEBUG"), message, data)
        : console.debug(formatPrefix("DEBUG"), message);
    }
  },

  info: (message, data) => {
    if (getCurrentLogLevel() <= LOG_LEVELS.INFO) {
      data !== undefined
        ? console.log(formatPrefix("INFO"), message, data)
        : console.log(formatPrefix("INFO"), message);
    }
  },

  warn: (message, data) => {
    if (getCurrentLogLevel() <= LOG_LEVELS.WARN) {
      data !== undefined
        ? console.warn(formatPrefix("WARN"), message, data)
        : console.warn(formatPrefix("WARN"), message);
    }
  },

  error: (message, data) => {
    if (getCurrentLogLevel() <= LOG_LEVELS.ERROR) {
      data !== undefined
        ? console.error(formatPrefix("ERROR"), message, data)
        : console.error(formatPrefix("ERROR"), message);
    }
  },
};

export default logger;