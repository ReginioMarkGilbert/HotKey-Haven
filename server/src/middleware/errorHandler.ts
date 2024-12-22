import { NextFunction, Request, Response } from 'express';

interface CustomError extends Error {
   statusCode?: number;
}

export const errorHandler = (
   err: CustomError,
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const statusCode = err.statusCode || 500;

   res.status(statusCode).json({
      success: false,
      error: {
         message: err.message || 'Internal Server Error',
         ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
   });
};