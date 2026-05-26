import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * Verifies a Bearer JWT, rejects special-purpose tokens (e.g. password reset),
 * and attaches the user's current DB state to req.user.
 *
 * IMPORTANT: We do NOT trust `permissions` from the JWT. The token may be up
 * to 7 days old. We pull `permissions` and `accountStatus` fresh from the DB
 * on every protected request so that:
 *   - permission changes take effect immediately
 *   - suspended accounts are locked out within one request
 *   - deleted users can't keep using their old token
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired.',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN',
      });
    }

    // Reject single-purpose tokens (password reset, etc.). These must never
    // grant access to protected endpoints.
    if (decoded.purpose) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.',
        code: 'INVALID_TOKEN_TYPE',
      });
    }

    // Pull fresh state from DB. Lean is fine — we only need a plain object.
    const user = await User.findById(decoded.userId)
      .select('role accountStatus permissions')
      .lean();

    if (!user) {
      // Token is valid but the user is gone. Treat as invalid.
      return res.status(401).json({
        success: false,
        message: 'Account not found.',
        code: 'USER_NOT_FOUND',
      });
    }

    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message:
          'Your account has been suspended. Please contact support to reactivate.',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    if (user.accountStatus === 'QUIT') {
      return res.status(403).json({
        success: false,
        message: 'This account is closed.',
        code: 'ACCOUNT_CLOSED',
      });
    }

    // Sanity check: if the role in the token doesn't match the DB role,
    // something's off (manual DB edit, role downgrade, etc.). Force re-login.
    if (decoded.role !== user.role) {
      return res.status(401).json({
        success: false,
        message: 'Session is out of date. Please log in again.',
        code: 'ROLE_CHANGED',
      });
    }

    req.user = {
      userId: decoded.userId,
      role: user.role,
      permissions: user.permissions || [],
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restricts access to one or more roles. Use after verifyToken.
 * Example: router.get('/admin/users', verifyToken, requireRole('SUPER_ADMIN'), handler)
 */
export const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have access to this resource.',
        code: 'FORBIDDEN_ROLE',
      });
    }
    next();
  };

/**
 * Requires a specific permission string. Use after verifyToken.
 * Super admins implicitly pass every permission check — they're the ones
 * granting permissions in the first place.
 *
 * Example:
 *   router.post('/parkinglocations',
 *     verifyToken,
 *     requirePermission('create_location'),
 *     handler);
 */
export const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated.',
      code: 'NOT_AUTHENTICATED',
    });
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const permissions = req.user.permissions || [];
  if (!permissions.includes(permission)) {
    return res.status(403).json({
      success: false,
      message: 'Permission denied.',
      code: 'FORBIDDEN_PERMISSION',
      required: permission,
    });
  }
  next();
};