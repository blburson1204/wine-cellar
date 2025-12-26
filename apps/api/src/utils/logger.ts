import winston from 'winston';
import { Request } from 'express';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

// Create base logger
export const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'wine-cellar-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    }),
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Stream for Morgan HTTP logging
export const httpLogStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

// Create contextual logger for requests
export const createLogger = (
  req?: Request
): {
  error: (message: string, error?: Error, extra?: object) => void;
  warn: (message: string, extra?: object) => void;
  info: (message: string, extra?: object) => void;
  debug: (message: string, extra?: object) => void;
} => {
  const meta = req
    ? {
        requestId: req.id,
        method: req.method,
        path: req.path,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (req as any).user?.id,
      }
    : {};

  return {
    error: (message: string, error?: Error, extra?: object): void => {
      logger.error(message, {
        ...meta,
        ...extra,
        ...(error && {
          error: error.message,
          stack: error.stack,
        }),
      });
    },
    warn: (message: string, extra?: object): void => {
      logger.warn(message, { ...meta, ...extra });
    },
    info: (message: string, extra?: object): void => {
      logger.info(message, { ...meta, ...extra });
    },
    debug: (message: string, extra?: object): void => {
      logger.debug(message, { ...meta, ...extra });
    },
  };
};
