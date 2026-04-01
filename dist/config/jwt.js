"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_SECRET = (process.env.JWT_SECRET || "access_secret");
const REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || "refresh_secret");
const ACCESS_EXPIRES = (process.env.JWT_EXPIRES_IN || "15m");
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES_IN || "7d");
const signAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
};
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map