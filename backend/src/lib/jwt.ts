import jwt from "jsonwebtoken";

export const generateAccessToken = (user: any) => {
    try {
        return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
            expiresIn: '1h'
        })
    } catch (error) {
        return null;
    }
}

export const generateRefreshToken = (user: any) => {
    try {
        return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET!, { 
            expiresIn: "15d" 
        });
    } catch (error) {
        return null;
    }
};

export const verifyAccessToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
        return decoded;
    } catch (error) {
        return null;
    }
}

export const verifyRefreshToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
        return decoded;
    } catch (error) {
        return null;
    }
}