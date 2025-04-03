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

export const validateRequest = (schema: yup.ObjectSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return res.status(400).json({
          errors: err.errors,
        });
      }
      next(err);
    }
  };
};
