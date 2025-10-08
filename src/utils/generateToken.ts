import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string;


export const generateAccessToken = (_id: string, role: string, firstName: string, secondName: string, email: string) => {
    return jwt.sign({ _id, role, firstName, secondName, email },
        ACCESS_SECRET,
        { expiresIn: "15m" }   
    )
}

export const generateRefreshToken = (_id: string, role: string, firstName: string, secondName: string, email: string) => {
    return jwt.sign(
        { _id, role, firstName, secondName, email },
        REFRESH_SECRET,
        { expiresIn: "1d" }
    )
}

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_SECRET);
}; 