import { Request, Response } from "express";
import { getProfileService, loginUser, registerUserService, getAllUsersService } from '../services/auth.service.js';
import prisma from '../config/prisma.js';
import { generateAccessToken, verifyRefreshToken } from "../lib/jwt.js";

export const getAllUsersController = async (req: any, res: Response) => {
    try {
        const currentUserId = req.user.id;
        const users = await getAllUsersService(currentUserId);
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error
        });
    }
};

export const getProfileController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user.user;

        const result = await getProfileService(userId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in user profile",
            error: error
        });
    }
}

export const loginController = async (req: Request, res: Response) => {

    try {
        const { accessToken, refreshToken, user } = await loginUser(req.body);
        // access token in cookie (IMPORTANT)
        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 15 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        // refresh token in cookie (IMPORTANT)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/api/auth/refresh", // important security
        });


        res.status(200).json({
            message: "User logged in successfully",
            success: true,
            accessToken,
            data: user
        })
    } catch (error: any) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        if (error.message === 'INVALID_PASSWORD') {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            })
        }
        if (error.message === 'FAILED_TO_GENERATE_TOKEN') {
            return res.status(500).json({
                success: false,
                message: "Failed to generate token"
            })
        }
        res.status(500).json({
            success: false,
            message: "Error in user login",
            error: error
        });
    }

}

export const registerController = async (req: Request, res: Response) => {
    try {
        const profileImage = req.file ? `/uploads/profiles/${req.file.filename}` : null;
        const result = await registerUserService({ ...req.body, profileImage });
        console.log("User registered successfully in database:", result);

        res.status(201).json({
            message: "User registered successfully",
            success: true,
            data: result
        });
    } catch (error: any) {
        if (error.message === 'USER_ALREADY_EXISTS') {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        res.status(500).json({
            success: false,
            message: "Error in user registration",
            error: error
        });
    }

}


export const logoutController = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in user logout",
            error: error
        });
    }
}



export const refreshController = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const decode = verifyRefreshToken(refreshToken);
        if (!decode) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        const newAccessToken = generateAccessToken({ id: (decode as any).id });



        return res.status(200).json({
            success: true,
            message: "User refreshed successfully",
            accessToken: newAccessToken
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in user refresh",
            error: error
        });
    }
}