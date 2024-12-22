import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

export const validateId = (req: Request, res: Response, next: NextFunction) => {
   const { id } = req.params;

   if (!Types.ObjectId.isValid(id))
   {
      return res.status(400).json({
         message: 'Invalid ID format'
      });
   }

   next();
};