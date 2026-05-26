import User from '../../models/userModel.js';
import {
  sendSuspensionEmail,
  sendReactivationEmail,
} from '../../services/emailService.js';

// Fields a super admin is allowed to modify via PATCH /users/:id.
// Anything else in the request body is silently ignored.
const ADMIN_EDITABLE_FIELDS = ['permissions', 'accountStatus'];

// The canonical list of permission strings. Anything outside this set is
// rejected so we don't accidentally grant typo'd or made-up permissions.
const VALID_PERMISSIONS = [
  'create_location',
  'view_analytics',
  'manage_bookings',
  'manage_tickets',
  'withdraw_wallet',
];

const VALID_ACCOUNT_STATUSES = ['ACTIVE', 'SUSPENDED', 'QUIT'];

/**
 * GET /users
 * Returns all users. Super-admin only.
 * The toJSON transform on the schema strips password_hash automatically.
 */
export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find({role : {$in : ["VENDOR","SUPER_ADMIN"]} }).sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/:id
 * Returns a single user by id. Super-admin only.
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    // findById throws CastError for malformed ObjectIds — treat as 404.
    if (error.name === 'CastError') {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }
    next(error);
  }
};

/**
 * PATCH /users/:id
 * Updates a user's permissions or accountStatus. Super-admin only.
 *
 * Self-protection rules:
 *   - A super admin cannot suspend themselves.
 *   - A super admin cannot modify another super admin (permissions or status).
 *   - Role and other identity fields are never editable here.
 *
 * Email side-effects:
 *   - Transition ACTIVE -> SUSPENDED fires a suspension email.
 *   - Transition SUSPENDED -> ACTIVE fires a reactivation email.
 *   - Email failures are logged but do NOT roll back the DB change. A failed
 *     send is recoverable (admin can resend manually) but a failed DB write
 *     followed by a successful email would be far worse — the user gets told
 *     they're suspended when they aren't.
 */
export const updateUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const actingUserId = req.user.userId;

    const target = await User.findById(targetUserId);
    if (!target) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }

    // Rule: can't modify yourself via this endpoint. Self-edits would let a
    // super admin lock themselves out. There's no legitimate reason to do it.
    if (target._id.toString() === actingUserId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot modify your own account here.',
        code: 'CANNOT_MODIFY_SELF',
      });
    }

    // Rule: super admins are equal — none can modify another.
    if (target.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Super admin accounts cannot be modified.',
        code: 'CANNOT_MODIFY_SUPER_ADMIN',
      });
    }

    // Build the update from only the whitelisted fields.
    const updates = {};
    for (const field of ADMIN_EDITABLE_FIELDS) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'No editable fields provided.' });
    }

    // Validate permissions array if present.
    if ('permissions' in updates) {
      if (!Array.isArray(updates.permissions)) {
        return res.status(400).json({
          success: false,
          message: 'permissions must be an array.',
        });
      }
      const invalid = updates.permissions.filter(
        (p) => !VALID_PERMISSIONS.includes(p),
      );
      if (invalid.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Unknown permissions: ${invalid.join(', ')}`,
          validPermissions: VALID_PERMISSIONS,
        });
      }
      // Deduplicate. Nice-to-have, prevents the toggle from creating dupes
      // if the frontend ever double-fires.
      updates.permissions = [...new Set(updates.permissions)];
    }

    // Validate accountStatus if present.
    if ('accountStatus' in updates) {
      if (!VALID_ACCOUNT_STATUSES.includes(updates.accountStatus)) {
        return res.status(400).json({
          success: false,
          message: `accountStatus must be one of: ${VALID_ACCOUNT_STATUSES.join(', ')}`,
        });
      }
    }

    // Capture status BEFORE the update so we can detect transitions.
    const previousStatus = target.accountStatus;

    const updated = await User.findByIdAndUpdate(targetUserId, updates, {
      new: true,
      runValidators: true,
    });

    // Fire status-change emails AFTER the DB write succeeds. We don't block
    // the response on email delivery — if SMTP is slow, we don't want the
    // admin's UI to hang. Errors are logged for follow-up.
    if ('accountStatus' in updates && updates.accountStatus !== previousStatus) {
      // Only the relevant transitions trigger emails. Going to QUIT, for
      // example, is silent — that's a terminal state, no email needed.
      if (
        previousStatus === 'ACTIVE' &&
        updates.accountStatus === 'SUSPENDED'
      ) {
        // Customers have no email (phone-only auth). Skip silently.
        if (updated.email) {
          sendSuspensionEmail(updated.email, updated.name).catch((err) => {
            console.error(
              `[SUSPENSION] Failed to email ${updated.email}:`,
              err.message,
            );
          });
        }
      } else if (
        previousStatus === 'SUSPENDED' &&
        updates.accountStatus === 'ACTIVE'
      ) {
        if (updated.email) {
          sendReactivationEmail(updated.email, updated.name).catch((err) => {
            console.error(
              `[REACTIVATION] Failed to email ${updated.email}:`,
              err.message,
            );
          });
        }
      }
    }

    return res.status(200).json(updated);
  } catch (error) {
    if (error.name === 'CastError') {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }
    next(error);
  }
};

/**
 * GET /users/me
 * Returns the currently authenticated user's full profile. Used by the
 * frontend on app load to refresh the cached user state (permissions may
 * have changed since the JWT was issued).
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};