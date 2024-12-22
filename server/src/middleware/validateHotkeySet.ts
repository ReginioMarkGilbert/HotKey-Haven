import { NextFunction, Request, Response } from 'express';

export const validateHotkeySet = (req: Request, res: Response, next: NextFunction) => {
   const { name, application } = req.body;

   // Only validate the required fields
   if (!name || !application)
   {
      return res.status(400).json({
         message: 'Name and application are required fields'
      });
   }

   // Allow any additional fields
   next();
};