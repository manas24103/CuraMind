/**
 * @typedef {'ADMIN'|'DOCTOR'|'PATIENT'|'NURSE'|'PHARMACIST'|'STAFF'} UserRole
 * @typedef {import('mongoose').Types.ObjectId} ObjectId
 * @typedef {import('mongoose').Document} Document
 * @typedef {import('express').Request} ExpressRequest
 */

/**
 * @typedef {Object} BaseUser
 * @property {string} id - The user's unique identifier
 * @property {UserRole} role - The user's role
 * @property {any} [key: string] - Additional user properties
 */

/**
 * @typedef {ExpressRequest & {
 *   user?: BaseUser,
 *   doctor?: BaseUser & {
 *     specialization?: string,
 *     experience?: number,
 *     profilePicture?: string,
 *     comparePassword?: (password: string) => Promise<boolean>
 *   },
 *   doctorId?: string,
 *   token?: string
 * }} Request
 */

/**
 * @typedef DoctorRegistrationData
 * @property {string} name - Doctor's full name
 * @property {string} email - Doctor's email address
 * @property {string} password - Plain text password (will be hashed)
 * @property {string} specialization - Medical specialization
 * @property {number} experience - Years of experience
 * @property {boolean} [isAdmin] - Whether the doctor has admin privileges
 */

/**
 * @typedef {Document & {
 *   _id: ObjectId,
 *   name: string,
 *   email: string,
 *   password: string,
 *   specialization: string,
 *   experience: number,
 *   profilePicture?: string,
 *   patients: ObjectId[],
 *   appointments: ObjectId[],
 *   isAdmin: boolean,
 *   comparePassword: (password: string) => Promise<boolean>,
 *   createdAt: Date,
 *   updatedAt: Date,
 *   generateAuthToken: () => Promise<string>
 * }} DoctorDocument
 */

// This module doesn't export anything at runtime, it's just for JSDoc
export {};
