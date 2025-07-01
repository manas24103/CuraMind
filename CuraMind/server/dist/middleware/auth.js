"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const User_1 = require("../models/User");
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
        const user = await User_1.User.findById(decoded.id);
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};
exports.authenticate = authenticate;
