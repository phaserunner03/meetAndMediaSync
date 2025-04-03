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
