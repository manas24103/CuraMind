import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface TypedResponse<ResBody = any> extends Response {
  json: (body: ApiResponse<ResBody>) => this;
}
