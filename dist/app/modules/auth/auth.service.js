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
exports.AuthServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = require("../user/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const auth_utils_1 = require("./auth.utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email: payload.email });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "No user is found");
    }
    if (!(user === null || user === void 0 ? void 0 : user.isActivated)) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This user is deactivated");
    }
    if (!(yield user_model_1.User.isPasswordMached(payload.password, user.password))) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Wrong password, Try again");
    }
    // create token and send to the client
    const jwtPayload = {
        id: user._id,
        email: user.email,
        role: user.role
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken, refreshToken, user
    };
});
const updatePassword = (userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userData.id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "No user found");
    }
    if (!(user === null || user === void 0 ? void 0 : user.isActivated)) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This user is deactivated");
    }
    if (!(yield user_model_1.User.isPasswordMached(payload.oldPassword, user.password))) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Previous password doesn't match");
    }
    const hashedNewPassword = yield bcrypt_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const result = yield user_model_1.User.findByIdAndUpdate(user.id, { password: hashedNewPassword, needsPasswordChange: false, passwordChangedAt: new Date() }, { new: true });
    return result;
});
const refreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    // checking if the token is missing
    if (!refreshToken) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
    }
    // checking if the given token is valid
    const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.jwt_refresh_secret);
    const { id, iat, email, role } = decoded;
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
    const jwtPayload = {
        id,
        email,
        role
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return { accessToken };
});
exports.AuthServices = { login, updatePassword, refreshToken };
