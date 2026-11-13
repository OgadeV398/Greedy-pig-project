import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from './errors.js';

export const signToken = (player) =>
  jwt.sign({ sub: player.id, username: player.username }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

function parse(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError(401, 'BAD_TOKEN', 'Malformed Authorization header');
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return { id: Number(payload.sub), username: payload.username };
  } catch {
    // A token was sent but it's expired/forged: tell the client so it can log in again.
    throw new AppError(401, 'BAD_TOKEN', 'Your session has expired. Please log in again.');
  }
}

/** Sets req.user if a valid token is present; anonymous requests pass through. */
export function optionalAuth(req, _res, next) {
  try {
    req.user = parse(req);
    next();
  } catch (e) {
    next(e);
  }
}

export function requireAuth(req, _res, next) {
  try {
    req.user = parse(req);
    if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', 'Please log in to continue');
    next();
  } catch (e) {
    next(e);
  }
}
