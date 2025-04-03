import {Request, Response, NextFunction} from 'express';
import * as yup from "yup";
import { StatusCodes } from '../constants/status-codes.constants';
import { ErrorResponseMessages } from '../constants/service-messages.constants';

export const validateRequest = (schema: yup.ObjectSchema<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        
        await schema.validate(req.body, { abortEarly: false });
        next(); 
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: ErrorResponseMessages.VALIDATION_ERROR,
            errors: error.errors,
          });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ErrorResponseMessages.INTERNAL_ERROR,
          error: (error as Error).message,
        });
      }
    };
  };

