import { ZodError } from 'zod';
import { GameRuleError } from '../lib/gameEngine.js';
import { config } from '../config.js';

export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (req, _res, next) =>
  next(new AppError(404, 'NOT_FOUND', `No route for ${req.method} ${req.path}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = 500;
  let body = { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side. Please try again.' };

  if (err instanceof AppError) {
    status = err.status;
    body = { code: err.code, message: err.message, details: err.details };
  } else if (err instanceof ZodError) {
    status = 400;
    const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    body = { code: 'VALIDATION_ERROR', message: details[0]?.message ?? 'Invalid input', details };
  } else if (err instanceof GameRuleError) {
    status = 409;
    body = { code: 'GAME_RULE', message: err.message };
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    body = { code: 'BAD_JSON', message: 'Request body is not valid JSON' };
  } else if (err.type === 'entity.too.large') {
    status = 413;
    body = { code: 'TOO_LARGE', message: 'Request body is too large' };
  }

  if (status === 500 && !config.isTest) console.error(err);
  res.status(status).json({ error: body });
}
