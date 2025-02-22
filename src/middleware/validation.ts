import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";

// ✅ Corrected Validation Middleware (No async, proper typing)
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; // Ensure `next()` is NOT called after sending a response
  }
  next();
};

// ✅ Now properly typing `validateMyUserRequest`
export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("addressLine1").isString().notEmpty().withMessage("AddressLine1 must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  handleValidationErrors as RequestHandler, // ✅ Explicitly casting this as `RequestHandler`
];
