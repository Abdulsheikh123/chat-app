import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../lib/jwt.js";
 
interface CustomRequest extends Request {
    user?: any;
}

export const protectAuth = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        console.log("--- Auth Check ---");
        console.log("Path:", req.path);
        console.log("Cookies:", req.cookies);
        const token = req.cookies.token;
        
        if (!token) {
            console.warn("Auth Failed: No token found in cookies");
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided"
            });
        }

        const decode = verifyAccessToken(token);
        
        if (!decode || typeof decode === 'string') {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid or expired token"
            });
        }
           
        req.user = decode;
        next();
        
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - Token validation failed"
        });
    }
}