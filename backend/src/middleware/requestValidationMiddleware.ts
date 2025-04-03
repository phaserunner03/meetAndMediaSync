//winston logging
//yup validation 
//edge cases validation service level
// read me file 

//frontend -> deployment -> 1) prod user  2) dev -> changes append (CICD)
//backend -> deployment -> 1) prod user  2) dev -> changes append (CICD)
//staging 


// diagram  
import { Request, Response, NextFunction } from "express";
import * as yup from "yup";
import logger from "../utils/logger";

export const validateRequest = (schema: yup.ObjectSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      logger.info({
        functionName: "validateRequest",
        message: "Request body validated successfully",
        data: req.body,
      });
      next();
    } catch (err) {
        logger.error({
        functionName: "validateRequest",
        message: "Request body validation failed",
        data: {
          name: (err as Error).name,
          stack: (err as Error).stack,
        },
        });
      if (err instanceof yup.ValidationError) {
        return res.status(400).json({
          errors: err.errors,
        });
      }
      next(err);
    }
  };
};
