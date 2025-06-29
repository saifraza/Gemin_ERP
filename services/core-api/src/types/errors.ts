// Prisma error types
export interface PrismaError extends Error {
  code?: string;
  meta?: Record<string, any>;
  clientVersion?: string;
}

// Check if error is a Prisma error
export function isPrismaError(error: unknown): error is PrismaError {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

// Known Prisma error codes
export const PrismaErrorCode = {
  UniqueConstraintViolation: 'P2002',
  ForeignKeyConstraintViolation: 'P2003',
  RecordNotFound: 'P2025',
  TableNotFound: 'P2021',
  ColumnNotFound: 'P2022',
} as const;

// Application error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}