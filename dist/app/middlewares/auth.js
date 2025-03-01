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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const user_model_1 = require("../modules/user/user.model");
const AppError_1 = __importDefault(require("../errors/AppError"));
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const accessToken = req.headers.authorization;
        // checking if the token is missing
        if (!accessToken) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(accessToken, config_1.default.jwt_access_secret);
        }
        catch (error) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
        }
        const { id, role, email, iat } = decoded;
        // checking if the user is exist
        const user = yield user_model_1.User.isUserExistsById(id);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found !');
        }
        if (!(user === null || user === void 0 ? void 0 : user.isActivated)) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is already Deactivated !');
        }
        if (user.passwordChangedAt &&
            user_model_1.User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized !');
        }
        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized !');
        }
        req.user = decoded;
        next();
    }));
};
exports.default = auth;
