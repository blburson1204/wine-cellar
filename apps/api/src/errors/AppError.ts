/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
    public errorCode?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(400, message, true, 'VALIDATION_ERROR');
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(404, message, true, 'NOT_FOUND');
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, true, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, true, 'FORBIDDEN');
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, true, 'CONFLICT');
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public originalError?: Error
  ) {
    super(500, message, true, 'DATABASE_ERROR');
  }
}

/**
 * Base image upload error (400)
 */
export class ImageUploadError extends AppError {
  constructor(message: string, errorCode: string = 'IMAGE_UPLOAD_ERROR') {
    super(400, message, true, errorCode);
  }
}

/**
 * File too large error (400)
 */
export class FileTooLargeError extends ImageUploadError {
  constructor(size: number, maxSize: number) {
    const sizeMB = Math.round(size / 1024 / 1024);
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    super(`File size ${sizeMB}MB exceeds maximum ${maxSizeMB}MB`, 'FILE_TOO_LARGE');
  }
}

/**
 * Invalid file type error (400)
 */
export class InvalidFileTypeError extends ImageUploadError {
  constructor(mimeType: string) {
    super(
      `File type ${mimeType} is not supported. Please upload JPEG, PNG, or WebP images.`,
      'INVALID_FILE_TYPE'
    );
  }
}

/**
 * Invalid image error (400)
 */
export class InvalidImageError extends ImageUploadError {
  constructor(reason: string) {
    super(`Invalid image: ${reason}`, 'INVALID_IMAGE');
  }
}
