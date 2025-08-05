"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const AuthService_1 = require("../services/AuthService");
const authService = new AuthService_1.AuthService();
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No valid authorization header found' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = yield authService.verifyIdToken(idToken);
        req.userId = decodedToken.uid;
        req.userEmail = decodedToken.email;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});
exports.authenticateUser = authenticateUser;
