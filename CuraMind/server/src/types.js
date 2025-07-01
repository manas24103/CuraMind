/**
 * @typedef {import('mongoose').Types.ObjectId} ObjectId
 * @typedef {import('mongoose').Document} Document
 * @typedef {import('express').Request} Request
 * @typedef {import('jsonwebtoken').JwtPayload} JwtPayload
 */

/**
 * @typedef BaseDoctor
 * @property {string} name - Doctor's full name
 * @property {string} email - Doctor's email address
 * @property {string} password - Hashed password
 * @property {string} specialization - Medical specialization
 * @property {number} experience - Years of experience
 * @property {string} [profilePicture] - URL to profile picture (optional)
 * @property {ObjectId[]} patients - Array of patient IDs
 * @property {ObjectId[]} appointments - Array of appointment IDs
 * @property {boolean} isAdmin - Whether the doctor has admin privileges
 * @property {Date} createdAt - When the doctor was created
 * @property {Date} updatedAt - When the doctor was last updated
 */

/**
 * @typedef DoctorRegistrationData
 * @property {string} name - Doctor's full name
 * @property {string} email - Doctor's email address
 * @property {string} password - Plain text password (will be hashed)
 * @property {string} specialization - Medical specialization
 * @property {number} experience - Years of experience
 * @property {boolean} [isAdmin] - Whether the doctor has admin privileges (optional)
 */

/**
 * @typedef {import('./models/Doctor').IDoctor} IDoctor
 */

/**
 * @typedef LoginCredentials
 * @property {string} email - User's email
 * @property {string} password - User's password
 */

/**
 * @typedef {JwtPayload & {
 *   id: string,
 *   role: string,
 *   email: string,
 *   iat: number,
 *   exp: number
 * }} JwtPayloadExtended
 */

/**
 * @template T
 * @typedef ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {T} [data] - Response data
 * @property {string} [error] - Error message if the request failed
 * @property {string} [message] - Optional message
 */

/**
 * Extends the Express Request type to include the doctor property
 * @typedef {Request & {
 *   doctor?: IDoctor
 * }} AuthenticatedRequest
 */

// This module doesn't export anything at runtime, it's just for JSDoc
export {};
