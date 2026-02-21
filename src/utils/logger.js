/**
 * Debug Logger Utility
 * Color-coded, structured logging for debugging API requests.
 * 
 * Usage:
 *   import log from '../utils/logger.js';
 *   log.info('controllerName', 'stepDescription', { key: value });
 *   log.error('controllerName', 'what failed', error);
 */

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const timestamp = () => new Date().toISOString().slice(11, 23); // HH:mm:ss.sss

const log = {
  /** General info — step-by-step progress */
  info(tag, message, data = null) {
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.cyan}[${tag}]${COLORS.reset}`;
    if (data) {
      console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 0) : data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  },

  /** Successful operation */
  success(tag, message, data = null) {
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.green}✓ [${tag}]${COLORS.reset}`;
    if (data) {
      console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 0) : data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  },

  /** Warning — something unexpected but not fatal */
  warn(tag, message, data = null) {
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.yellow}⚠ [${tag}]${COLORS.reset}`;
    if (data) {
      console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 0) : data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  },

  /** Error — something broke */
  error(tag, message, err = null) {
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.red}✗ [${tag}]${COLORS.reset}`;
    console.error(`${prefix} ${message}`);
    if (err) {
      console.error(`${COLORS.red}  → ${err.message || err}${COLORS.reset}`);
      if (err.stack) {
        // Print first 3 stack frames for context
        const frames = err.stack.split('\n').slice(1, 4).join('\n');
        console.error(`${COLORS.gray}${frames}${COLORS.reset}`);
      }
    }
  },

  /** HTTP request entry — used by request logger middleware */
  request(method, url, userId = null) {
    const userStr = userId ? ` user=${userId}` : '';
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.magenta}→${COLORS.reset}`;
    console.log(`${prefix} ${COLORS.bright}${method}${COLORS.reset} ${url}${COLORS.gray}${userStr}${COLORS.reset}`);
  },
};

export default log;
