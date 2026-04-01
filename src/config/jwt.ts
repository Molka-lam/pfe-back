import jwt from "jsonwebtoken";

const ACCESS_SECRET = (process.env.JWT_SECRET || "access_secret") as string;
const REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || "refresh_secret") as string;
const ACCESS_EXPIRES = (process.env.JWT_EXPIRES_IN || "15m") as any;
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any;

export const signAccessToken = (payload: any) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
};

export const signRefreshToken = (payload: any) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch {
    return null;
  }
};
