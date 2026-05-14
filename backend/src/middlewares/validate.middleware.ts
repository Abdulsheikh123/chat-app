import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export const validate = (schema: ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: result.error.issues.map((err) => ({
        field: err.path[0],
        message: err.message,
      })),
    });
  }

  next();
};