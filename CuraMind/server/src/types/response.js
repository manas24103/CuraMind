/**
 * @typedef {Object} ApiResponse
 * @template T
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} message - Response message
 * @property {T} [data] - Response data
 * @property {string} [error] - Error message if the request failed
 */

/**
 * @template ResBody
 * @typedef {import('express').Response & {
 *   json: (body: ApiResponse<ResBody>) => any;
 * }} TypedResponse
 */

// This module doesn't export anything at runtime, it's just for JSDoc
export {};
