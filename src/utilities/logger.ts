import winston from 'winston';
import path from 'path';

// Custom format for structured JSON logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  defaultMeta: {
    service: 'ifs-sync-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console output (for Docker/Grafana)
    new winston.transports.Console({
      format: jsonFormat
    }),
    
    // Daily rotating file for JSON logs
    new winston.transports.File({
      filename: path.join('logs', `ifs-${new Date().toISOString().split('T')[0]}.json`),
      format: jsonFormat,
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 30 // Keep 30 days
    }),
    
    // Error-only file
    new winston.transports.File({
      filename: path.join('logs', 'error.json'),
      level: 'error',
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.json'),
      format: jsonFormat
    })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.json'),
      format: jsonFormat
    })
  ]
});

// Helper functions for structured logging
export const logSyncStart = (tableName: string, action: string, data: any) => {
  logger.info('IFS sync operation started', {
    tableName,
    action,
    data,
    operationType: 'sync_start'
  });
};

export const logSyncSuccess = (tableName: string, action: string, data: any, result: any) => {
  logger.info('IFS sync operation completed', {
    tableName,
    action,
    data,
    result: {
      ...result,
      success: true
    },
    operationType: 'sync_success'
  });
};

export const logSyncError = (tableName: string, action: string, data: any, error: any, result?: any) => {
  logger.error('IFS sync operation failed', {
    tableName,
    action,
    data,
    error: {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    },
    result: result ? {
      ...result,
      success: false
    } : {
      success: false
    },
    operationType: 'sync_error'
  });
};

export const logJsonRepairAttempt = (rawBody: string, error: string) => {
  logger.warn('JSON parse failed, attempting repair', {
    error,
    rawBodyLength: rawBody.length,
    rawBodyPreview: rawBody.substring(0, 200),
    operationType: 'json_repair_attempt'
  });
};

export const logJsonRepairSuccess = (originalBody: string, repairedData: any) => {
  logger.info('JSON repair successful', {
    originalBodyLength: originalBody.length,
    repairedData,
    operationType: 'json_repair_success'
  });
};

export const logJsonRepairFailure = (originalBody: string, error: string) => {
  logger.error('JSON repair failed', {
    error,
    originalBody,
    operationType: 'json_repair_failure'
  });
};

export const logServerStart = (port: number | string) => {
  logger.info('IFS Sync API started successfully', {
    port,
    environment: process.env.NODE_ENV || 'development',
    operationType: 'server_start'
  });
};

export const logRouteError = (tableName: string, action: string, data: any, error: any) => {
  logger.error('IFS sync route error', {
    tableName,
    action,
    data,
    error: {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    },
    operationType: 'route_error'
  });
};
