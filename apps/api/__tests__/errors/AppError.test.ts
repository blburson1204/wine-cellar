import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  ImageUploadError,
  FileTooLargeError,
  InvalidFileTypeError,
  InvalidImageError,
} from '../../src/errors/AppError';

describe('AppError Classes', () => {
  describe('AppError', () => {
    it('creates error with correct properties', () => {
      const error = new AppError(500, 'Test error', true, 'TEST_ERROR');

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Test error');
      expect(error.isOperational).toBe(true);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.name).toBe('AppError');
      expect(error.stack).toBeDefined();
    });

    it('defaults isOperational to true', () => {
      const error = new AppError(400, 'Test error');

      expect(error.isOperational).toBe(true);
    });

    it('allows errorCode to be undefined', () => {
      const error = new AppError(400, 'Test error');

      expect(error.errorCode).toBeUndefined();
    });

    it('extends Error class', () => {
      const error = new AppError(500, 'Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ValidationError', () => {
    it('creates error with status 400 and VALIDATION_ERROR code', () => {
      const error = new ValidationError('Validation failed');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('ValidationError');
    });

    it('includes field errors when provided', () => {
      const fields = {
        name: ['Name is required'],
        email: ['Invalid email format'],
      };
      const error = new ValidationError('Validation failed', fields);

      expect(error.fields).toEqual(fields);
    });

    it('allows fields to be undefined', () => {
      const error = new ValidationError('Validation failed');

      expect(error.fields).toBeUndefined();
    });

    it('extends AppError', () => {
      const error = new ValidationError('Validation failed');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('NotFoundError', () => {
    it('creates error with status 404 and NOT_FOUND code', () => {
      const error = new NotFoundError('Wine');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Wine not found');
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('NotFoundError');
    });

    it('includes ID in message when provided', () => {
      const error = new NotFoundError('Wine', '123');

      expect(error.message).toBe("Wine with ID '123' not found");
    });

    it('creates message without ID when not provided', () => {
      const error = new NotFoundError('User');

      expect(error.message).toBe('User not found');
    });

    it('extends AppError', () => {
      const error = new NotFoundError('Wine');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('UnauthorizedError', () => {
    it('creates error with status 401 and UNAUTHORIZED code', () => {
      const error = new UnauthorizedError();

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(error.errorCode).toBe('UNAUTHORIZED');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('UnauthorizedError');
    });

    it('accepts custom message', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.message).toBe('Invalid token');
    });

    it('extends AppError', () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnauthorizedError);
    });
  });

  describe('ForbiddenError', () => {
    it('creates error with status 403 and FORBIDDEN code', () => {
      const error = new ForbiddenError();

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
      expect(error.errorCode).toBe('FORBIDDEN');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('ForbiddenError');
    });

    it('accepts custom message', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.message).toBe('Access denied');
    });

    it('extends AppError', () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ForbiddenError);
    });
  });

  describe('ConflictError', () => {
    it('creates error with status 409 and CONFLICT code', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Resource already exists');
      expect(error.errorCode).toBe('CONFLICT');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('ConflictError');
    });

    it('extends AppError', () => {
      const error = new ConflictError('Conflict');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ConflictError);
    });
  });

  describe('DatabaseError', () => {
    it('creates error with status 500 and DATABASE_ERROR code', () => {
      const error = new DatabaseError('Database connection failed');

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Database connection failed');
      expect(error.errorCode).toBe('DATABASE_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('DatabaseError');
    });

    it('includes original error when provided', () => {
      const originalError = new Error('Connection timeout');
      const error = new DatabaseError('Database connection failed', originalError);

      expect(error.originalError).toBe(originalError);
    });

    it('allows originalError to be undefined', () => {
      const error = new DatabaseError('Database error');

      expect(error.originalError).toBeUndefined();
    });

    it('extends AppError', () => {
      const error = new DatabaseError('Database error');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(DatabaseError);
    });
  });

  describe('ImageUploadError', () => {
    it('creates error with status 400 and default IMAGE_UPLOAD_ERROR code', () => {
      const error = new ImageUploadError('Upload failed');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Upload failed');
      expect(error.errorCode).toBe('IMAGE_UPLOAD_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('ImageUploadError');
    });

    it('accepts custom error code', () => {
      const error = new ImageUploadError('Upload failed', 'CUSTOM_ERROR');

      expect(error.errorCode).toBe('CUSTOM_ERROR');
    });

    it('extends AppError', () => {
      const error = new ImageUploadError('Upload failed');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ImageUploadError);
    });
  });

  describe('FileTooLargeError', () => {
    it('creates error with FILE_TOO_LARGE code and formatted message', () => {
      const size = 10 * 1024 * 1024; // 10MB
      const maxSize = 5 * 1024 * 1024; // 5MB
      const error = new FileTooLargeError(size, maxSize);

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('File size 10MB exceeds maximum 5MB');
      expect(error.errorCode).toBe('FILE_TOO_LARGE');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('FileTooLargeError');
    });

    it('rounds file sizes to nearest MB', () => {
      const size = 3.7 * 1024 * 1024; // 3.7MB
      const maxSize = 2 * 1024 * 1024; // 2MB
      const error = new FileTooLargeError(size, maxSize);

      expect(error.message).toBe('File size 4MB exceeds maximum 2MB');
    });

    it('extends ImageUploadError', () => {
      const error = new FileTooLargeError(10 * 1024 * 1024, 5 * 1024 * 1024);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ImageUploadError);
      expect(error).toBeInstanceOf(FileTooLargeError);
    });
  });

  describe('InvalidFileTypeError', () => {
    it('creates error with INVALID_FILE_TYPE code and formatted message', () => {
      const error = new InvalidFileTypeError('image/gif');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(
        'File type image/gif is not supported. Please upload JPEG, PNG, or WebP images.'
      );
      expect(error.errorCode).toBe('INVALID_FILE_TYPE');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('InvalidFileTypeError');
    });

    it('extends ImageUploadError', () => {
      const error = new InvalidFileTypeError('image/gif');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ImageUploadError);
      expect(error).toBeInstanceOf(InvalidFileTypeError);
    });
  });

  describe('InvalidImageError', () => {
    it('creates error with INVALID_IMAGE code and formatted message', () => {
      const error = new InvalidImageError('Corrupted file');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid image: Corrupted file');
      expect(error.errorCode).toBe('INVALID_IMAGE');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('InvalidImageError');
    });

    it('extends ImageUploadError', () => {
      const error = new InvalidImageError('Bad format');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ImageUploadError);
      expect(error).toBeInstanceOf(InvalidImageError);
    });
  });
});
